import fs from 'fs';
import path from 'path';

export default class FileHelper {
  constructor(uploader, localPath, networkParentDirPath) {
    this.uploader = uploader;
    this.localPath = localPath;
    this.fileName = path.basename(localPath);
    this.size = fs.statSync(this.localPath).size;
    this.uploadedSize = 0;
    this.onCompleteCallback = function() {};
    this.networkParentDirPath = networkParentDirPath[networkParentDirPath.length - 1] === '/' ?
      networkParentDirPath : networkParentDirPath + '/';
  }

  _OnContentUploaded(err, uploadedSize) {
    uploadedSize = uploadedSize || 0;
    if (err) {
      console.error(err);
      if (this.onCompleteCallback) {
        this.onCompleteCallback('Failed to update file ' + err.data.description);
      }
      return this.uploader.onError('Failed to update file ' + this.networkParentDirPath + this.fileName +
        '\n' + err.data.description);
    }
    this.uploadedSize += uploadedSize;
    if (this.uploadedSize === this.size && this.onCompleteCallback) {
      this.onCompleteCallback();
    }
    this.uploader.progressListener.onSuccess(uploadedSize, this.networkParentDirPath + this.fileName);
  }
  //
  // _uploadFileContent(err) {
  //   let self = this;
  //   if (err) {
  //     return self._OnContentUploaded(err);
  //   }
  //   if (self.size === 0) {
  //     return self._OnContentUploaded(err, 0);
  //   }
  //   console.log('Updating file content', this.networkParentDirPath + this.fileName);
  //   self.uploader.api.modifyFileContent(this.networkParentDirPath + this.fileName, false, this.localPath, 0,
  //     function(err, uploadedSize) {
  //      self._OnContentUploaded(err, uploadedSize);
  //     }
  //   );
  // }

  upload(callback) {
    let self = this;
    this.onCompleteCallback = callback;
    console.log('Creating file', this.networkParentDirPath + this.fileName);
    self.uploader.api.createFile(this.networkParentDirPath + this.fileName, '',
                                 false, this.localPath, function(err, uploadedSize) {
                                  self._OnContentUploaded(err, uploadedSize);
                                 });
  }
}
