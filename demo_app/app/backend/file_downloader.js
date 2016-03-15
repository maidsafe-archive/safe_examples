import fs from 'fs';
import temp from 'temp';
import path from 'path';
import remote from 'remote';

export default class Downloader {
  constructor(api, filePath, size, isShared, onComplete) {
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
  }

  setStatusCallback(callback) {
    this.statusCallback = callback;
  }

  setOnCompleteCallback(callback) {
    this.onComplete = callback;
  }

  _postStatus() {
    if (!this.statusCallback) {
      return;
    }
    this.statusCallback(Math.floor((this.downloadedSize * 100) / this.size));
  }

  _onResponse(err, data) {
    if (err) {
      fs.closeSync(this.fd);
      return this.onComplete(err);
    }
    fs.writeSync(this.fd, new Buffer(data), 0, data.length, this.downloadedSize);
    this.downloadedSize += data.length;
    this._postStatus();
    if (this.downloadedSize === this.size) {
      fs.closeSync(this.fd);
      this.onComplete();
    } else {
      this._downloadContent();
    }
  }

  _downloadContent() {
    var self = this;
    var length = Math.min(this.MAX_SIZE_FOR_DOWNLOAD, this.size - this.downloadedSize);
    self.api.getFile(this.filePath, this.isShared, this.downloadedSize, length, function(err, data) {
      self._onResponse(err, data);
    });
  }

  download() {
    var self = this;
    var tempDir = temp.mkdirSync('safe-demo-');
    this.downloadPath = path.resolve(tempDir, path.basename(self.filePath));
    this.fd = fs.openSync(this.downloadPath, 'w', 0o666);
    this._downloadContent();
    this._postStatus();
  }

  open() {
    remote.shell.openItem(this.downloadPath);
  }
}
