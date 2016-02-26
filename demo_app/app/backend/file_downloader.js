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
    this.MAX_SIZE_FOR_DOWNLOAD = 512000; // 500kb (500 * 1024)
  }

  setOnCompleteCallback(callback) {
    this.onComplete = callback;
  }

  _onResponse(err, data) {
    if (err) {
      return this.onComplete(err);
    }
    this.downloadedSize += data.length;
    fs.writeFileSync(this.downloadPath, new Buffer(data));
    if (this.downloadedSize === this.size) {
      this.onComplete();
    } else {
      _downloadContent();
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
    this._downloadContent();
  }

  open() {
    remote.shell.openItem(this.downloadPath);
  }
}
