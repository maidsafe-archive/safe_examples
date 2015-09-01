module.exports = function(onStart, onProgress, onComplete) {
  var fs = require('fs');
  var path = require('path');
  var mime = require('mime');

  var safeApi = require('../scripts/safe_api/api');
  var EXCEPTION_ERROR_CODE = 999;

  // TODO can replace ProgessHanlder with Async.js
  var ProgressHandler = function(totalSize, callback) {
    var completed = 0;
    var alive = true;

    this.update = function(error, size) {
      if (!alive) {
        return;
      }
      if (error) {
        alive = false;
        callback ? callback(error) : function(){ /*no-op*/ };
        return;
      }
      completed += size;
      var meter = (completed * 100) / totalSize;
      onProgress(meter);
      if (completed === totalSize) {
        callback ? callback() : function(){ /*no-op*/ };
      }
    };
  };

  /**
   * Creates a public directory in the network
   * @param directoryPath
   * @param callback
   */
  var createDirectoryInNetwork = function(directoryPath, callback) {
    console.log('Creating directory ' + directoryPath);
    safeApi.createDirectory(directoryPath, callback);
  };

  /**
   * Writes file to the network
   * @param localDirectory - Local directory to look for the file
   * @param networkDirectory - Directory in the network to save the file
   * @param fileName - Name of teh file
   * @param size - Size of the file
   * @param handler - ProgressHandler
   */
  var writeFileToNetwork = function(localDirectory, networkDirectory, fileName, size, handler) {
    console.log("Creating file " + fileName + "  in " + networkDirectory);
    safeApi.createFile(networkDirectory, fileName, path.join(localDirectory, fileName), handler.update);
  };

  /**
   * Recursively computes the size of the directory
   * @param folderPath
   * @returns {number} size of the Directory
   */
  var computeDirectorySize = function(folderPath) {
    var stats;
    var tmpPath;
    var size = 0;
    var dirContents = fs.readdirSync(folderPath);
    for (var index in dirContents) {
      tmpPath = path.join(folderPath, dirContents[index]);
      stats = fs.statSync(tmpPath);
      if (stats.isDirectory()) {
        size += computeDirectorySize(tmpPath);
      } else {
        size += stats.size;
      }
    }
    return size;
  };

  /**
   * Upload the files after reading through the directory.
   * For the root directory the networkDirectoryPath will be null and as it is called recursively the network path gets building
   * Files can be created only after the directory is ready on the network. Thus, files are uploaded on the callback of
   * createDirectoryInNetwork function
   * @param folderPath - Local folder path
   * @param handler - ProgressHandler
   * @param networkDirectoryPath - Path of the directory in the network
   */
  // TODO simplify implementation - refactor
  var uploadFiles = function(folderPath, handler, networkDirectoryPath) {
    var stats;
    if(!networkDirectoryPath) {
      networkDirectoryPath = path.basename(folderPath);
      createDirectoryInNetwork(networkDirectoryPath, function(error) {
        if(error || error > 0) {
          throw 'Failed to create directory : ' + networkDirectoryPath;
        }
        uploadFiles(folderPath, handler, networkDirectoryPath);
      });
      return;
    }
    var dirContents = fs.readdirSync(folderPath);
    for (var index in dirContents) {
      stats = fs.statSync(path.join(folderPath, dirContents[index]));
      if (stats.isDirectory()) {
        var networkPath = networkDirectoryPath + '/' + dirContents[index];
        createDirectoryInNetwork(networkPath, function(error) {
          if(error || error > 0) {
            throw 'Failed to create directory : ' + networkDirectoryPath;
          }
          uploadFiles(path.join(folderPath, dirContents[index]), handler, networkPath);
        });
      } else {
        writeFileToNetwork(folderPath, networkDirectoryPath, dirContents[index], stats.size, handler);
      }
    }
  };

  /**
   * DNS registration is the last step after Uploading the files to the network
   * @param errorCode
   */
  var registerDnsCallback = function(errorCode) {
    if (errorCode !== 0) {
      console.log('Registration FAILED :: ' + errorCode);
      onComplete(errorCode);
    } else {
      onComplete();
    }
  };

  /**
   * Entry point for uploading the files to the network
   * Start Uploading teh directory to the network
   * Callback for onStart, updatingProgress and onComplete will be triggered as the process is done
   * @param folderPath
   */
  var uploadFolder = function(serviceName, publicName, folderPath) {
    var stats = fs.statSync(folderPath);
    if (!stats.isDirectory()) {
      alert('Drag and drop a directory!');
      return;
    }
    onStart();
    try {
      var handler = new ProgressHandler(computeDirectorySize(folderPath), function(err) {
        if (err) {
          onComplete(err);
          return;
        }
        try {
          safeApi.registerDns(publicName, serviceName, path.basename(folderPath), registerDnsCallback);
        } catch (e) {
          console.log(e);
          onComplete(EXCEPTION_ERROR_CODE);
        }
      });
      handler.update(null, 0);
      uploadFiles(folderPath, handler);
    } catch(e) {
      console.error(e);
      window.showSection('failure');
    }
  };

  this.uploadFolder = uploadFolder;
  return this;
};
