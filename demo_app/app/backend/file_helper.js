import fs from 'fs';
import path from 'path';

export default class FileHelper {
  constructor(uploader, localPath, networkParentDirPath) {
    this.uploader = uploader;
    this.localPath = localPath;
    this.fileName = path.basename(localPath);
    this.size = fs.statSync(this.localPath).size;
    // this.fd = fs.openSync(this.localPath, 'r');
    this.uploadedSize = 0;
    this.onCompleteCallback = function() {};
    this.networkParentDirPath = networkParentDirPath[networkParentDirPath.length - 1] === '/' ?
      networkParentDirPath : networkParentDirPath + '/';
  }

  _OnContentUploaded(err, uploadedSize) {
    if (err) {
      console.error(err);
      this.onCompleteCallback(err);
      return this.uploader.onError('Failed to update file ' + this.networkParentDirPath + this.fileName);
    }
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
    // this.uploadedSize += uploadedSize;
    // if (this.uploadedSize < this.size) {
    //   this._uploadContent();
    // } else {
    //   if (this.onCompleteCallback) {
    //     this.onCompleteCallback();
    //   }
    // }
    this.uploader.progressListener.onSuccess(uploadedSize, this.networkParentDirPath + this.fileName);
  }
/*
  _uploadContent() {
    var self = this;
    var MAX_SIZE_FOR_UPLOAD = 512000; // 500kb (500 * 1024)
    var buffer = new Buffer(Math.min(MAX_SIZE_FOR_UPLOAD, (this.size - this.uploadedSize)));
    fs.readSync(this.fd, buffer, 0, buffer.length, this.uploadedSize);
    self.uploader.api.modifyFileContent(this.networkParentDirPath + this.fileName, false,
      new Uint8Array(buffer), this.uploadedSize,
      function(err) {
        self._OnContentUploaded(err, buffer.length);
      });
  }
*/

  upload(callback) {
    let self = this;
    this.onCompleteCallback = callback;
    console.log('Creating file', this.networkParentDirPath + this.fileName);
    if (self.size > 0) {
      self.uploader.progressListener.onSuccess(Math.floor(self.size/4), this.networkParentDirPath + this.fileName);
    }
    self.uploader.api.createFile(this.networkParentDirPath + this.fileName, '', false, self.localPath, function(err) {
      if (err) {
        console.error(err);
        return self.uploader.onError('Failed to create file ' + self.networkParentDirPath + self.fileName);
      }
      self._OnContentUploaded(null, self.size - Math.floor(self.size/4));
    });
  }
}
