import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import remote from 'remote';

export default class Downloader {
  constructor(api, filePath, size, isShared, tempDirPath, onComplete) {
    this.api = api;
    this.filePath = filePath;
    this.size = size;
    this.isShared = isShared;
    this.onComplete = onComplete;
    this.downloadedSize = 0;
    this.downloadPath = null;
    this.fd = null;
    this.statusCallback = null;
    this.MAX_SIZE_FOR_DOWNLOAD = 512000; // 500kb (500 * 1024)
    this.tempDirPath = tempDirPath;
  }

  setStatusCallback(callback) {
    this.statusCallback = callback;
  }

  setOnCompleteCallback(callback) {
    this.onComplete = callback;
  }
  /* jscs:disable disallowDanglingUnderscores*/
  _postStatus() {
    if (!this.statusCallback) {
      return;
    }
    let status = (this.downloadedSize === 0 && this.size === 0) ? 100 :
      Math.floor((this.downloadedSize * 100) / this.size);
    this.statusCallback(status);
  }

  _onResponse(err, sizeDownloaded) {
    if (err) {
      return this.onComplete(err);
    }
    this.downloadedSize += sizeDownloaded;
    this._postStatus();
    if (this.downloadedSize === this.size) {
      this.onComplete();
    }
  }

  _downloadContent() {
    var self = this;
    var length = Math.min(this.MAX_SIZE_FOR_DOWNLOAD, this.size - this.downloadedSize);
    self.api.getFile(this.filePath, this.isShared, this.downloadPath, function(err, sizeDownloaded) {
      self._onResponse(err, sizeDownloaded);
    });
  }
  /* jscs:enable disallowDanglingUnderscores*/

  download() {
    var self = this;
    console.log('TO download', this.size);
    this.downloadPath = path.resolve(self.tempDirPath, path.basename(self.filePath));
    if (this.size === 0) {
      this.onComplete();
    } else {
      /* jscs:disable disallowDanglingUnderscores*/
      this._downloadContent();
    }
    this._postStatus();
    /* jscs:enable disallowDanglingUnderscores*/
  }

  open() {
    var self = this;
    fse.ensureFile(this.downloadPath, function(err) {
      if (err) {
        /* jscs:disable disallowDanglingUnderscores*/
        return self._onResponse('Not able to write file on local machine', self.size);
        /* jscs:enable disallowDanglingUnderscores*/
      }
      remote.shell.showItemInFolder(self.downloadPath);
    });
  }
}
