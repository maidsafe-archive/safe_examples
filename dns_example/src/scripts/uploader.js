/* global alert: false, window: false */
module.exports = function(safeApi, onStart, onProgress, onComplete) {
  var fs = require('fs');
  var path = require('path');
  // var mime = require('mime');
  var log = require('npmlog');

  var EXCEPTION_ERROR_CODE = 999;

  // TODO can replace ProgessHanlder with Async
  var ProgressHandler = function(totalSize, callback) {
    var completed = 0;
    var alive = true;

    this.update = function(error, size) {
      if (!alive) {
        return;
      }
      if (error) {
        alive = false;
        return callback ? callback(error) : function() {
          onComplete(error);
        };
      }
      completed += size;
      var meter = (completed * 100) / totalSize;
      onProgress(meter);
      if (completed === totalSize) {
        return callback ? callback() : function() { /*no-op*/ };
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
    safeApi.nfs.createDirectory(false, directoryPath, false, false, null, callback);
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
    console.log('Creating file ' + fileName + '  in ' + networkDirectory);
    var data = fs.readFileSync(path.join(localDirectory, fileName));
    var Callback = function(size) {
      this.execute = function(err) {
        handler.update(err, size);
      };
      return this.execute;
    };
    safeApi.nfs.createFile(false, networkDirectory + '/' + fileName, null, data.toString('base64'), new Callback(size));
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
      if (dirContents[index]) {
        tmpPath = path.join(folderPath, dirContents[index]);
        stats = fs.statSync(tmpPath);
        if (stats.isDirectory()) {
          size += computeDirectorySize(tmpPath);
        } else {
          size += stats.size;
        }
      }
    }
    return size;
  };

  var uploadDirectory = function(folderPath, networkDirectoryPath, subDirectoryName, handler) {
    var networkPath = networkDirectoryPath + '/' + subDirectoryName;
    createDirectoryInNetwork(networkPath, function(error) {
      if (error) {
        handler.update('Failed to create directory : ' + networkDirectoryPath);
        return;
      }
      uploadFiles(path.join(folderPath, subDirectoryName) , handler, networkPath);
    });
  };

  /**
   * Upload the files after reading through the directory.
   * For the root directory the networkDirectoryPath will be null and as it is called
   * recursively the network path gets building
   * Files can be created only after the directory is ready on the network. Thus, files are uploaded on the callback of
   * createDirectoryInNetwork function
   * @param folderPath - Local folder path
   * @param handler - ProgressHandler
   * @param networkDirectoryPath - Path of the directory in the network
   */
  // TODO simplify implementation - refactor
  var uploadFiles = function(folderPath, handler, networkDirectoryPath) {
    var stats;
    if (!networkDirectoryPath) {
      networkDirectoryPath = path.basename(folderPath);
      createDirectoryInNetwork(networkDirectoryPath, function(error) {
        if (error) {
          handler.update('Failed to create directory : ' + networkDirectoryPath);
        }
        uploadFiles(folderPath, handler, networkDirectoryPath);
      });
      return;
    }

    var dirContents = fs.readdirSync(folderPath);
    for (var index in dirContents) {
      if (dirContents[index]) {
        stats = fs.statSync(path.join(folderPath, dirContents[index]));
        if (stats.isDirectory()) {
          uploadDirectory(folderPath, networkDirectoryPath, dirContents[index], handler);
        } else {
          writeFileToNetwork(folderPath, networkDirectoryPath, dirContents[index], stats.size, handler);
        }
      }
    }
  };

  /**
   * DNS registration is the last step after Uploading the files to the network
   * @param errorCode
   */
  var registerDnsCallback = function(error) {
    if (error) {
      log.error('Registration FAILED :: ' + error.description);
      onComplete(error);
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
          safeApi.dns.registerDns(publicName, serviceName, false, path.basename(folderPath), registerDnsCallback);
        } catch (e) {
          console.log(e);
          onComplete(EXCEPTION_ERROR_CODE);
        }
      });
      handler.update(null, 0);
      uploadFiles(folderPath, handler);
    } catch (e) {
      console.error(e);
      window.showSection('failure');
    }
  };

  this.uploadFolder = uploadFolder;
  return this;
};
