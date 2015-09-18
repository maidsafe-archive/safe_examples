var ffi = require('ffi');
var ref = require('ref');
var ArrayType = require('ref-array');
var IntArray = ArrayType(ref.types.int);
var fs = require('fs');
var path = require('path');

var safeIo = (function() {
  var api;
  var safeClientPtrPtr = ref.refType(ref.refType(ref.types.void));
  var clientPtrPtr;

  this.load = function(libPath) {
    if (process.platform !== 'win32' && process.platform !== 'mac' && process.platform !== 'darwin') {
      var RTLD_NOW = ffi.DynamicLibrary.FLAGS.RTLD_NOW;
      var RTLD_GLOBAL = ffi.DynamicLibrary.FLAGS.RTLD_GLOBAL;
      var mode = RTLD_NOW | RTLD_GLOBAL;
      // TODO scan the dir for libsodium.so and pick the version rather than hardcoding 13(version)
      ffi.DynamicLibrary(path.resolve(libPath, 'libsodium.so.13'), mode);
    }
    api = ffi.Library(path.resolve(libPath, process.platform === 'win32' ? 'safe_ffi' : 'libsafe_ffi'), {
      'create_account': ['int', ['string', 'string', 'string', safeClientPtrPtr]],
      'log_in': ['int', ['string', 'string', 'string', safeClientPtrPtr]],
      'create_sub_directory': ['int', [safeClientPtrPtr, 'string', 'bool', 'bool']],
      'create_file': ['int', [safeClientPtrPtr, 'string', IntArray, 'int']],
      'register_dns': ['int', [safeClientPtrPtr, 'string', 'string', 'string']]
    });
  };

  this.createAccount = function(keyword, pin, password) {
    clientPtrPtr = ref.alloc(safeClientPtrPtr);
    return api.create_account(keyword, pin, password, clientPtrPtr);
  };

  this.login = function(keyword, pin, password) {
    clientPtrPtr = ref.alloc(safeClientPtrPtr);
    return api.log_in(keyword, pin, password, clientPtrPtr);
  };

  this.createDirectory = function(directoryPath) {
    return api.create_sub_directory(clientPtrPtr.deref(), directoryPath, false, false);
  };

  this.createFile = function(directoryPath, fileName, contents) {
    return api.create_file(clientPtrPtr.deref(), directoryPath + '/' + fileName, contents, contents.length);
  };

  this.registerDns = function(publicName, serviceName, directoryPath) {
    return api.register_dns(clientPtrPtr.deref(), publicName, serviceName, directoryPath);
  };

  return this;
})();

process.on('message', function(request) {

  var load = function(path) {
    try {
      safeIo.load(path);
    } catch(ex) {
      process.send('Load failed : ' + path );
      process.abort();
    }
  };

  var createAccount = function(keyword, pin, password) {
    try {
      safeIo.createAccount(keyword, pin, password);
      process.send('Account Created Successfully');
    } catch(ex) {
      process.send({
        error: 999,
        msg: ex.toString()
      });
    }
  };

  var login = function(keyword, ppin, password) {
    try {
      safeIo.login(keyword, pin, password);
      process.send('Logged in Successfully');
    } catch(ex) {
      process.send({
        error: 999,
        msg: ex.toString()
      });
    }
  };

  var createDirectory = function(directoryPath, postback) {
    try {
      process.send({
        error: safeIo.createDirectory(directoryPath, false),
        data: true,
        postback: postback
      });
    } catch(ex) {
      process.send(ex.message);
      process.send({
        error: 999,
        msg: ex.message,
        postback: postback
      });
    }
  };

  var createFile = function(directoryPath, fileName, localFilePath, postback) {
    try {
      var contents = fs.readFileSync(localFilePath);
      process.send({
        error: safeIo.createFile(directoryPath, fileName, contents),
        data: contents.length,
        postback: postback
      });
    } catch(ex) {
      process.send({
        error: 999,
        msg: ex.message,
        postback: postback
      });
    }
  };

  var registerDns = function(publicName, serviceName, directoryPath, postback) {
    try {
      process.send({
        error: safeIo.registerDns(publicName, serviceName, directoryPath),
        data: true,
        postback: postback
      });
    } catch(ex) {
      process.send({
        error: 999,
        msg: ex.message,
        postback: postback
      });
    }
  };

  switch (request.method) {
    case 'init':
      var keyword;
      var pin;
      var password;
      load(request.libPath);
      keyword = Math.random().toString(16).substring(5);
      pin = Math.random().toString().substring(4).substring(0, 4);
      password = Math.random().toString().substring(4).substring(0, 4);
      process.send('Creating Account :: ');
      process.send('     Keyword   - ' + keyword);
      process.send('     Pin       - ' + pin);
      process.send('     Password  - ' + password);
      createAccount(keyword, pin, password);
      login(keyword, pin, password);
      break;

    case 'create_directory':
      createDirectory(request.directoryPath, request.postback);
      break;

    case 'create_file':
      createFile(request.directoryPath, request.fileName, request.localFilePath, request.postback);
      break;

    case 'register_dns':
       registerDns(request.publicName, request.serviceName, request.directoryPath, request.postback);
      break;

    default :
      break;
  }
});


process.on('uncaughtException',function(err) {
  process.send(err.message);
});
