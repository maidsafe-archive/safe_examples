import fs from 'fs';
import path from 'path';
import FileHelper from './file_helper';

export let computeDirectorySize = function(localPath) {
  let size = 0;
  let stat;
  let tempPath;
  let contents = fs.readdirSync(localPath);
  for (var i in contents) {
    tempPath = localPath + '/' + contents[i];
    stat = fs.statSync(tempPath);
    if (stat.isDirectory()) {
      size += computeDirectorySize(tempPath);
    } else {
      size += stat.size;
    }
  }
  return size;
};

export class DirectoryHelper {
  constructor(uploader, isPrivate, localPath, networkParentDirPath) {
    this.uploader = uploader;
    this.isPrivate = isPrivate;
    this.localPath = localPath;
    this.isRoot = true;
    this.networkParentDirPath = networkParentDirPath;
  }

  _onDirectoryCreated(err, localPath, networkParentDirPath) {
    if (err && !this.isRoot) {
      console.log(err);
      return this.uploader.updateProgressOnFailure(computeDirectorySize(this.localPath), this.localPath);
    }
    if (this.isRoot) {
      this.isRoot = false;
    }
    let stat;
    let tempPath;
    let contents = fs.readdirSync(localPath);
    for (var i in contents) {
      tempPath = localPath + '/' + contents[i];
      stat = fs.statSync(tempPath);
      if (stat.isDirectory()) {
        this._uploadDirectory(tempPath, networkParentDirPath + '/' + contents[i]);
      } else {
        new FileHelper(this.uploader, tempPath, networkParentDirPath).upload();
      }
    }
  }

  _uploadDirectory(localPath, networkPath) {
    let self = this;
    console.log('Dir ::', localPath, networkPath);
    this.uploader.api.createDir(networkPath, this.isPrivate, null, false, false, function(err) {
      self._onDirectoryCreated(err, localPath, networkPath);
    });
  }

  upload() {
    this._uploadDirectory(this.localPath, this.networkParentDirPath);
  }
}
