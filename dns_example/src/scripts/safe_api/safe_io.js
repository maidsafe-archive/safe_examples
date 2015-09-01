var ffi = require('ffi');
var ref = require('ref');
var ArrayType = require('ref-array');
var IntArray = ArrayType(ref.types.int);
var fs = require('fs');

var safeIo = (function() {
  var api;

  this.load = function(path) {
    api = ffi.Library(path, {
      'create_sub_directory': ['int', ['string', 'bool']],
      'create_file': ['int', ['string', IntArray, 'int']],
      'register_dns': ['int', ['string', 'string', 'string']]
    });
  };

  this.createDirectory = function(directoryPath) {
    return api.create_sub_directory(directoryPath, false);
  };

  this.createFile = function(directoryPath, fileName, contents) {
    return api.create_file(directoryPath + '/' + fileName, contents, contents.length);
  };

  this.registerDns = function(publicName, serviceName, directoryPath) {
    return api.register_dns(publicName, serviceName, directoryPath);
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
      load(request.libPath);
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
