import fs from 'fs';
import path from 'path';
import env from '../env';
import FileHelper from './file_helper';
import { getDirectoryStats, DirectoryHelper } from './directory_helper';

class ProgressListener {
  constructor(updateCallback) {
    this.total = 0;
    this.totalFileCount = 0;
    this.filesCompletedCount = 0;
    /* jscs:disable disallowDanglingUnderscores*/
    this._completed = 0;
    this._success = 0;
    this._failed = 0;
    this._failedPaths = [];
    this._updateCallback = updateCallback;
    /* jscs:enable disallowDanglingUnderscores*/
  }

  onError(size, path) {
    /* jscs:disable disallowDanglingUnderscores*/
    this._failed += size;
    this._completed += size;
    this._failedPaths.push(path);
    if (this._updateCallback) {
      this._updateCallback(this._completed, this.total);
    }
    /* jscs:enable disallowDanglingUnderscores*/
  }

  onSuccess(size, fileName) {
    /* jscs:disable disallowDanglingUnderscores*/
    this._success += size;
    this._completed += size;
    if (this._updateCallback) {
      var status;
      if (this.totalFileCount > 0) {
        status = this.filesCompletedCount +
        '/' + this.totalFileCount;
      }
      this._updateCallback(this._completed, this.total, status);
    }
    /* jscs:enable disallowDanglingUnderscores*/
  }
}

export default class Uploader {
  constructor(api, progressCallback) {
    this.api = api;
    this.progressListener = new ProgressListener(progressCallback);
    this.onError = null;
    this.helper = null;
  }

  uploadDirectory(isPrivate, localPath, networkParentDirPath, isRoot) {
    this.helper = new DirectoryHelper(this, isPrivate, localPath, networkParentDirPath);
    this.helper.upload();
  }

  uploadFile(localPath, networkParentDirPath) {
    var self = this;
    this.helper = new FileHelper(this, localPath, networkParentDirPath);
    this.helper.upload();
  }

  upload(localPath, isPrivate, networkPath) {
    let stat = fs.statSync(localPath);
    if (stat.isDirectory()) {
      let dirStats = getDirectoryStats(localPath);
      this.progressListener.total = dirStats.size;
      this.progressListener.totalFileCount = dirStats.files;
      this.uploadDirectory(isPrivate, localPath, networkPath || '/', true);
    } else {
      if (env.isFileUploadSizeRestricted && stat.size > env.maxFileUploadSize) {
        throw new Error('File larger than ' + (env.maxFileUploadSize / 1000000) + ' MB can not be uploaded');
      }
      this.progressListener.total = stat.size;
      this.uploadFile(localPath, networkPath || '/');
    }
    return this.progress;
  }

  setOnErrorCallback(callback) {
    this.onError = callback;
  }

  cancel() {
    this.isAborted = true;
    this.helper.cancel();
  }
}
