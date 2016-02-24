import fs from 'fs';
import path from 'path';

export default class Uploader {
  constructor(api) {
    this.api = api;
  }

  upload(localPath, isPrivate, networkPath) {
    let api = this.api;
    let progress = {
      total: 0,
      completed: 0,
      failed: 0,
      failedFiles: [],
      onUpdate: function() {}
    };

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

    let updateProgressOnFailure = function(size, path) {
      progress.failed += size;
      progress.failedFiles.push(localPath);
      progress.onUpdate();
    };

    let FileCreationHanlder = function(fileName, localPath, networkParentDirPath) {
      let size = fs.statSync(localPath).size;
      let ContentUpdated = function(size) {
        this.onResponse = function(err) {
          if (err) {
            console.error(err);
            return updateProgressOnFailure(size, localPath);
          }
          progress.completed += size;
          progress.onUpdate();
        };
        return this.onResponse;
      };

      this.onResponse = function(err) {
        if (err) {
          console.error(err);
          return updateProgressOnFailure(size, localPath);
        }
        window.upData = new Uint8Array(fs.readFileSync(localPath));
        api.modifyFileContent(networkParentDirPath + '/' + fileName, false,
          new Uint8Array(fs.readFileSync(localPath)), 0, new ContentUpdated(size));
        console.log('updating content', networkParentDirPath + '/' + fileName);
      };

      return this.onResponse;
    };

    let uploadFile = function(localPath, networkParentDirPath) {
      let fileName = path.basename(localPath);
      let hanlder = new FileCreationHanlder(fileName, localPath, networkParentDirPath);
      console.log('Creating file', networkParentDirPath + '/' + fileName);
      api.createFile(networkParentDirPath + '/' + fileName, '', false, hanlder);
    };

    let DirectoryCreationHanler = function(isPrivate, localPath, networkParentDirPath, isRoot) {
      this.onResponse = function(err) {
        if (err && !isRoot) {
          console.log(err);
          return updateProgressOnFailure(computeDirectorySize(localPath), localPath);
        }
        let stat;
        let tempPath;
        let contents = fs.readdirSync(localPath);
        for (var i in contents) {
          tempPath = localPath + '/' + contents[i];
          stat = fs.statSync(tempPath);
          if (stat.isDirectory()) {
            uploadDirectory(isPrivate, tempPath, networkParentDirPath);
          } else {
            uploadFile(tempPath, networkParentDirPath);
          }
        }
      };
      return this.onResponse;
    };

    let uploadDirectory = function(isPrivate, localPath, networkParentDirPath, isRoot) {
      networkParentDirPath += isRoot ? '' : ('/' + path.basename(localPath));
      let hanlder = new DirectoryCreationHanler(isPrivate, localPath, networkParentDirPath, isRoot);
      console.log('Dir ::', localPath, networkParentDirPath);
      api.createDir(networkParentDirPath, isPrivate, null, false, false, hanlder);
    };

    let stat = fs.statSync(localPath);
    if (stat.isDirectory()) {
      progress.total = computeDirectorySize(localPath);
      uploadDirectory(isPrivate, localPath, networkPath || '/', true);
    } else {
      progress.total = stat.size;
      uploadFile(localPath, networkPath || '/');
    }
    return progress;
  }
}
