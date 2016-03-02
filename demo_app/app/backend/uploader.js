import fs from 'fs';
import path from 'path';
import env from '../env';
import FileHelper from './file_helper';
import { computeDirectorySize, DirectoryHelper } from './directory_helper';

class ProgressListener {
  constructor(updateCallback) {
    this.total = 0;
    this._completed = 0;
    this._success = 0;
    this._failed = 0;
    this._failedPaths = [];
    this._updateCallback = updateCallback;
  }

  onError(size, path) {
    this._failed += size;
    this._completed += size;
    this._failedPaths.push(path);
    if (this._updateCallback) {
      this._updateCallback(this._completed, this.total);
    }
  }

  onSuccess(size, fileName) {
    this._success += size;
    this._completed += size;
    if (this._updateCallback) {
      this._updateCallback(this._completed, this.total, fileName);
    }
  }
}

export default class Uploader {
  constructor(api, progressCallback) {
    this.api = api;
    this.progressListener = new ProgressListener(progressCallback);
  }

  uploadDirectory(isPrivate, localPath, networkParentDirPath, isRoot) {
    new DirectoryHelper(this, isPrivate, localPath, networkParentDirPath).upload();
  }

  uploadFile(localPath, networkParentDirPath) {
    new FileHelper(this, localPath, networkParentDirPath).upload();
  }

  upload(localPath, isPrivate, networkPath) {
    let stat = fs.statSync(localPath);
    if (stat.isDirectory()) {
      this.progressListener.total = computeDirectorySize(localPath);
      this.uploadDirectory(isPrivate, localPath, networkPath || '/', true);
    } else {
      if (env.isFileUploadSizeRestricted && stat.size > env.maxFileUploadSize) {
        throw new Error('File greater than ' + env.isFileUploadSizeRestricted + ' bytes can not be uploaded');
      }
      this.progressListener.total = stat.size;
      this.uploadFile(localPath, networkPath || '/');
    }
    return this.progress;
  }
}
