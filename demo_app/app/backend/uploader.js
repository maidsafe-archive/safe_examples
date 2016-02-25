import fs from 'fs';
import path from 'path';
import FileHelper from './file_helper';
import { computeDirectorySize, DirectoryHelper } from './directory_helper';

export default class Uploader {
  constructor(api) {
    this.api = api;
    this.progress = {
      total: 0,
      completed: 0,
      failed: 0,
      failedFiles: [],
      onUpdate: function() {}
    };
  }

  updateProgressOnFailure(size, path) {
    this.progress.failed += size;
    // this.progress.failedFiles.push(localPath);
    this.progress.onUpdate();
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
      this.progress.total = computeDirectorySize(localPath);
      this.uploadDirectory(isPrivate, localPath, networkPath || '/', true);
    } else {
      this.progress.total = stat.size;
      this.uploadFile(localPath, networkPath || '/');
    }
    return this.progress;
  }
}
