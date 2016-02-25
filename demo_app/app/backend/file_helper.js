import fs from 'fs';
import path from 'path';

export default class FileHelper {
  constructor(uploader, localPath, networkParentDirPath) {
    this.uploader = uploader;
    this.localPath = localPath;
    this.fileName = path.basename(localPath);
    this.size = fs.statSync(this.localPath).size;
    this.networkParentDirPath = networkParentDirPath[ networkParentDirPath.length - 1 ] === '/' ?
    networkParentDirPath : networkParentDirPath + '/';    
  }

  _OnContentUploaded(err) {
    if (err) {
      console.error(err);
      return this.uploader.updateProgressOnFailure(this.size, this.localPath);
    }
    this.uploader.progress.completed += this.size;
    this.uploader.progress.onUpdate();
  }

  _onFileCreated(err) {
    let self = this;
    if (err) {
      console.error(err);
      return this.uploader.updateProgressOnFailure(this.size, this.localPath);
    }
    this.uploader.api.modifyFileContent(this.networkParentDirPath + this.fileName, false,
      new Uint8Array(fs.readFileSync(this.localPath)), 0, function(err) {
        self._OnContentUploaded(err);
      });
    console.log('updating content', this.networkParentDirPath + '/' + this.fileName);
  }

  upload() {
    let self = this;
    console.log('Creating file', this.networkParentDirPath + '/' + this.fileName);
    self.uploader.api.createFile(this.networkParentDirPath + '/' + this.fileName, '', false, function(err) {
      self._onFileCreated(err);
    });
  }
}
