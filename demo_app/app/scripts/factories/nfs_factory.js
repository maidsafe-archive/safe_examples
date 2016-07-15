/**
 * Nfs factory
 */
window.maidsafeDemo.factory('nfsFactory', [ function(Shared) {
  'use strict';
  var self = this;
  var mime = require('mime');
  var ROOT_PATH = {
    APP: 'app',
    DRIVE: 'drive'
  };
  var fs = require('fs');
  var request = require('request');

  // create new directory
  self.createDir = function(dirPath, isPrivate, userMetadata, isPathShared, callback) {
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    dirPath = dirPath[0] === '/' ? dirPath.slice(1) : dirPath;
    var payload = {
      url: this.SERVER + 'nfs/directory/' + rootPath + '/' + dirPath,
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      },
      data: {
        isPrivate: isPrivate,
        userMetadata: userMetadata
      }
    };
    (new this.Request(payload, callback)).send();
  };

  // get specific directory
  self.getDir = function(callback, dirPath, isPathShared) {
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    var URL = this.SERVER + 'nfs/directory/' + rootPath + '/' + dirPath;
    var payload = {
      url: URL,
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      }
    };
    (new this.Request(payload, callback)).send();
  };

  self.deleteDirectory = function(dirPath, isPathShared, callback) {
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    var url = this.SERVER + 'nfs/directory/' + rootPath + '/' + dirPath;
    var payload = {
      url: url,
      method: 'DELETE',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      }
    };
    (new this.Request(payload, callback)).send();
  };

  self.deleteFile = function(filePath, isPathShared, callback) {
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    var payload = {
      url: this.SERVER + 'nfs/file/' + rootPath + '/' + filePath,
      method: 'DELETE',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      }
    };
    (new this.Request(payload, callback)).send();
  };

  self.createFile = function(filePath, metadata, isPathShared, localPath, callback) {
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    var url = this.SERVER + 'nfs/file/' + rootPath + '/' + filePath;

    var factor = 0;
    var fileStream = fs.createReadStream(localPath);
    fileStream.on('data', function(chunk) {
      factor++;
      callback(null, chunk.length - 1);
    });
    fileStream.pipe(request.post(url, {
      headers: {
        'Content-Type': mime.lookup(filePath),
        'metadata': metadata
      },
      auth: {
        'bearer': this.getAuthToken()
      }
    }, function(e, response) {
      if (response && response.statusCode === 200) {
        return callback(null, factor);
      }
      var errMsg = response.headers['Content-Type'] === 'application/json' ? JSON.parse(response.body) : 'Request connection closed';
      callback({data: errMsg});
    }));
  };

  self.modifyFileContent = function(filePath, isPathShared, localPath, offset, callback) {
    offset = offset || 0;
    var self = this;
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    var url = this.SERVER + 'nfs/file/' + rootPath + '/' + filePath;
    // TODO this factor usage is just a patch - must use a better implementation for progress bar handling
    var factor = 0;
    var fileStream = fs.createReadStream(localPath);
    fileStream.on('data', function(chunk) {
      factor++;
      callback(null, chunk.length - 1);
    });
    fileStream.pipe(request.put(url, {
      headers: {
        'Content-Type': mime.lookup(filePath),
        'Range': 'Bytes=' + offset + '-'
      },
      auth: {
        'bearer': self.getAuthToken()
      }
    }, function(e, response) {      
      if (response && response.statusCode === 200) {
        return callback(null, factor);
      }
      var errMsg = response.headers['Content-Type'] === 'application/json' ? JSON.parse(response.body) : 'Request connection closed';
      callback({data: errMsg});
    }));
  };

  self.getFile = function(filePath, isPathShared, downloadPath, callback) {
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    var url = this.SERVER + 'nfs/file/' + rootPath + '/' + filePath;
    var headers = {
      auth: {
      'bearer': this.getAuthToken()
      }
    };
    request.get(url, headers)
    .on('response', function(response) {
      if (response.statusCode !== 200 && response.statusCode !== 206) {
        callback('Failed with status ' + response.statusMessage);
      }
    })
    .on('data', function(d) {
      callback(null, d.length);
    })
    .pipe(fs.createWriteStream(downloadPath));
  };

  var rename = function(path, isPathShared, newName, isFile, callback) {
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    var url = this.SERVER + (isFile ? 'nfs/file/metadata/' : 'nfs/directory/') + rootPath + '/' + path;
    var payload = {
      url: url,
      method: 'PUT',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      },
      data: {
        name: newName
      }
    };
    (new this.Request(payload, callback)).send();
  };

  self.renameDirectory = function(dirPath, isPathShared, newName, callback) {
    rename(dirPath, isPathShared, newName, false, callback);
  };

  self.renameFile = function(oldPath, isPathShared, newPath, callback) {
    rename(dirPath, isPathShared, newName, true, callback);
  };
  return self;
} ]);
