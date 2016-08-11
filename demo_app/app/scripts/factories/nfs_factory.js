/**
 * Nfs factory
 */
window.maidsafeDemo.factory('nfsFactory', [ 'CONSTANT', function(CONSTANT) {
  'use strict';
  var self = this;
  var mime = require('mime');
  var fs = require('fs');
  var request = require('request');

  // create new directory
  self.createDir = function(dirPath, isPrivate, userMetadata, isPathShared, callback) {
    var rootPath = isPathShared ? CONSTANT.CONSTANT.ROOT_PATH.DRIVE : CONSTANT.ROOT_PATH.APP;
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
    var rootPath = isPathShared ? CONSTANT.ROOT_PATH.DRIVE : CONSTANT.ROOT_PATH.APP;
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
    var rootPath = isPathShared ? CONSTANT.ROOT_PATH.DRIVE : CONSTANT.ROOT_PATH.APP;
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
    var rootPath = isPathShared ? CONSTANT.ROOT_PATH.DRIVE : CONSTANT.ROOT_PATH.APP;
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
    var rootPath = isPathShared ? CONSTANT.ROOT_PATH.DRIVE : CONSTANT.ROOT_PATH.APP;
    var url = this.SERVER + 'nfs/file/' + rootPath + '/' + filePath;

    var factor = 0;
    var fileStream = fs.createReadStream(localPath);
    fileStream.on('data', function(chunk) {
      factor++;
      callback(null, chunk.length - 1);
    });
    var writeStream = request.post(url, {
      headers: {
        'Content-Length': fs.statSync(localPath).size,
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
      var errMsg;
      if (e) {
        errMsg = { description: 'Request connection closed' + (e.code ? (' - ' + e.code) : '') };
      } else if (response.statusCode === 401) {
        errMsg = { description: 'Could not authorise with launcher' };
      } else {
        errMsg = JSON.parse(response.body);
      }
      callback({ data: errMsg });
    });
    fileStream.pipe(writeStream);
    return writeStream;
  };

  // self.modifyFileContent = function(filePath, isPathShared, localPath, offset, callback) {
  //   offset = offset || 0;
  //   var self = this;
  //   var rootPath = isPathShared ? CONSTANT.ROOT_PATH.DRIVE : CONSTANT.ROOT_PATH.APP;
  //   var url = this.SERVER + 'nfs/file/' + rootPath + '/' + filePath;
  //   // TODO this factor usage is just a patch - must use a better implementation for progress bar handling
  //   var factor = 0;
  //   var fileStream = fs.createReadStream(localPath);
  //   fileStream.on('data', function(chunk) {
  //     factor++;
  //     callback(null, chunk.length - 1);
  //   });
  //   fileStream.pipe(request.put(url, {
  //     headers: {
  //       'Content-Type': mime.lookup(filePath),
  //       'Range': 'Bytes=' + offset + '-'
  //     },
  //     auth: {
  //       'bearer': self.getAuthToken()
  //     }
  //   }, function(e, response) {
  //     if (response && response.statusCode === 200) {
  //       return callback(null, factor);
  //     }
  //     var errMsg = e ? {description: 'Request connection closed - ' + e.code } : JSON.parse(response.body);
  //     callback({data: errMsg});
  //   }));
  // };

  self.getFile = function(filePath, isPathShared, downloadPath, callback) {
    var rootPath = isPathShared ? CONSTANT.ROOT_PATH.DRIVE : CONSTANT.ROOT_PATH.APP;
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

  self.rename = function(self, path, isPathShared, newName, isFile, callback) {
    var rootPath = isPathShared ? CONSTANT.ROOT_PATH.DRIVE : CONSTANT.ROOT_PATH.APP;
    var url = self.SERVER + (isFile ? 'nfs/file/metadata/' : 'nfs/directory/') + rootPath + '/' + path;
    var payload = {
      url: url,
      method: 'PUT',
      headers: {
        authorization: 'Bearer ' + self.getAuthToken()
      },
      data: {
        name: newName
      }
    };
    (new self.Request(payload, callback)).send();
  };

  self.renameDirectory = function(dirPath, isPathShared, newName, callback) {
    self.rename(this, dirPath, isPathShared, newName, false, callback);
  };

  self.renameFile = function(oldPath, isPathShared, newPath, callback) {
    self.rename(this, oldPath, isPathShared, newPath, true, callback);
  };

  self.moveOrCopy = function(self, srcPath, srcRootPath, destPath, destRootPath, isFile, toMove, callback) {
    srcRootPath = srcRootPath ? CONSTANT.ROOT_PATH.DRIVE : CONSTANT.ROOT_PATH.APP;
    destRootPath = destRootPath ? CONSTANT.ROOT_PATH.DRIVE : CONSTANT.ROOT_PATH.APP;
    var url = self.SERVER + (isFile ? 'nfs/movefile/' : 'nfs/movedir/');
    var payload = {
      url: url,
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + self.getAuthToken()
      },
      data: {
        srcPath: srcPath,
        destPath: destPath,
        srcRootPath: srcRootPath,
        destRootPath: destRootPath,
        action: (toMove ? 'MOVE' : 'COPY')
      }
    };
    (new self.Request(payload, callback)).send();
  };

  self.moveDirectory = function(srcPath, srcRootPath, destPath, destRootPath, callback) {
    self.moveOrCopy(this, srcPath, srcRootPath, destPath, destRootPath, false, true, callback);
  };

  self.moveFile = function(srcPath, srcRootPath, destPath, destRootPath, callback) {
    self.moveOrCopy(this, srcPath, srcRootPath, destPath, destRootPath, true, true, callback);
  };

  self.copyDirectory = function(srcPath, srcRootPath, destPath, destRootPath, callback) {
    self.moveOrCopy(this, srcPath, srcRootPath, destPath, destRootPath, false, false, callback);
  };

  self.copyFile = function(srcPath, srcRootPath, destPath, destRootPath, callback) {
    self.moveOrCopy(this, srcPath, srcRootPath, destPath, destRootPath, true, false, callback);
  };

  return self;
} ]);
