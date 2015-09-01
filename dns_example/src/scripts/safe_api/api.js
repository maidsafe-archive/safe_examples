var SafeApi = function() {
  var path = require('path');
  var fs = require('fs');

  var childProcess = require("child_process");
  var safeApiRootFolder = ((__dirname.indexOf('asar') === -1) ? './src/scripts/safe_api' : __dirname);
  var apiProcess = childProcess.fork(path.resolve(safeApiRootFolder, 'safe_io'));

  /**
   * Keeps track of the callback for the requests
   * Callbacks are refered by a key
   */
  var CallbackStore = {
    get: function(key) {
      return this[key]
    },
    delete: function(key) {
      delete this[key];
    },
    put: function(key, callback) {
      this[key] = callback;
    }
  };

  /**
   * Returns the libary file path
   * Here the unpacked library file from the asar file is retturned for a Packaged application, or normal path in developer mode
   * @returns Library File path
   */
  var getLibraryFileName = function() {
    var root = (__dirname.indexOf('asar') === -1) ? './src/scripts/safe_api/' : path.resolve(__dirname, '../../../../app.asar.unpacked/src/scripts/safe_api/');
    return path.resolve(root, 'libsafe_ffi');
  };

  apiProcess.on('exit', function() {
    console.log('Child Process Aborted');
  });

  // Once the response is sent from the child process the appropiarte call back is retrieved and the the callback is invoked
  apiProcess.on('message', function(msg) {
    if (!msg.postback) {
      console.log(msg);
      return;
    }
    if (msg.error === 999) { // Exception error code is 999 from the safeIO
      console.log('Exception : ' + msg.msg);
    }
    CallbackStore.get(msg.postback)(msg.error, msg.data);
    CallbackStore.delete(msg.postback);
  });

  this.createDirectory = function(directoryPath, callback) {
     CallbackStore.put(directoryPath, callback);
     apiProcess.send({
       method: 'create_directory',
       directoryPath: directoryPath,
       postback: directoryPath //postback is a key which gets returned as a part of the response. This is used to identify the callback
     });
  };

  this.createFile = function(directoryPath, fileName, localFilePath, callback) {
    CallbackStore.put(directoryPath + fileName, callback);
    apiProcess.send({
      method: 'create_file',
      directoryPath: directoryPath,
      fileName: fileName,
      localFilePath: localFilePath,
      postback: directoryPath + fileName
    });
  };

  this.registerDns = function(publicName, serviceName, directoryPath, callback) {
    CallbackStore.put(serviceName + publicName, callback);
    apiProcess.send({
      method: 'register_dns',
      publicName: publicName,
      serviceName: serviceName,
      directoryPath: directoryPath,
      postback: serviceName + publicName
    });
  };

  // Initialise the ffi loading before any operation is called
  apiProcess.send({
    method: 'init',
    libPath: getLibraryFileName()
  });

  return this;
};

module.exports = new SafeApi();
