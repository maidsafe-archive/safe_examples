import fs from 'fs';
import path from 'path';

class DirectoryCreationHanler {
  constructor(uploader, isPrivate, localPath, networkParentDirPath, isRoot) {
    this.uploader = uploader;
    this.isPrivate = isPrivate;
    this.localPath = localPath;
    this.networkParentDirPath = networkParentDirPath;
    this.isRoot = isRoot;
  }

  onResponse(err) {
    if (err && !this.isRoot) {
      console.log(err);
      return this.uploader.updateProgressOnFailure(computeDirectorySize(this.localPath), this.localPath);
    }
    let stat;
    let tempPath;
    let contents = fs.readdirSync(this.localPath);
    for (var i in contents) {
      tempPath = this.localPath + '/' + contents[i];
      stat = fs.statSync(tempPath);
      if (stat.isDirectory()) {
        this.uploader.uploadDirectory(this.isPrivate, tempPath, this.networkParentDirPath);
      } else {
        this.uploader.uploadFile(tempPath, this.networkParentDirPath);
      }
    }
  }
}

let computeDirectorySize = function(localPath) {
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

class FileCreationHanlder {
  constructor(uploader, fileName, localPath, networkParentDirPath) {
    this.uploader = uploader;
    this.fileName = fileName;
    this.localPath = localPath;
    this.networkParentDirPath = networkParentDirPath;
  }

  onResponse(err) {
    let size = fs.statSync(this.localPath).size;
    if (err) {
      console.error(err);
      return uploader.updateProgressOnFailure(size, this.localPath);
    }
    let OnUpdateComplete = function(uploader, size) {
      this.onResponse = function(err) {
        if (err) {
          console.error(err);
          return uploader.updateProgressOnFailure(size, localPath);
        }
        uploader.progress.completed += size;
        uploader.progress.onUpdate();
      };
      return this.onResponse;
    };
    this.uploader.api.modifyFileContent(this.networkParentDirPath + '/' + this.fileName, false,
      new Uint8Array(fs.readFileSync(this.localPath)), 0, new OnUpdateComplete(this.uploader, size));
    console.log('updating content', this.networkParentDirPath + '/' + this.fileName);
  }
}

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
    this.progress.failedFiles.push(localPath);
    this.progress.onUpdate();
  }

  uploadDirectory(isPrivate, localPath, networkParentDirPath, isRoot) {
    networkParentDirPath += isRoot ? '' : ('/' + path.basename(localPath));
    let hanlder = new DirectoryCreationHanler(this, isPrivate, localPath, networkParentDirPath, isRoot);
    console.log('Dir ::', localPath, networkParentDirPath);
    this.api.createDir(networkParentDirPath, isPrivate, null, false, false, function(err) {
      hanlder.onResponse(err);
    });
  }

  uploadFile(localPath, networkParentDirPath) {
    let fileName = path.basename(localPath);
    let hanlder = new FileCreationHanlder(this, fileName, localPath, networkParentDirPath);
    console.log('Creating file', networkParentDirPath + '/' + fileName);
    this.api.createFile(networkParentDirPath + '/' + fileName, '', false, function(err) {
      hanlder.onResponse(err);
    });
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
