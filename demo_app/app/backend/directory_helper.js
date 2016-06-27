import fs from 'fs';
import path from 'path';
import env from '../env';
import async from 'async';
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
      if (env.isFileUploadSizeRestricted && stat.size > env.maxFileUploadSize) {
        throw new Error('File more than ' + (env.maxFileUploadSize / 1000000) + ' Mb can not be uploaded');
      }
      size += stat.size;
    }
  }
  return size;
};

class TaskQueue {
  constructor(onError) {
    this.queue = [];
    this.onError = onError;
  }

  run() {
    if (this.queue.length === 0) {
      return;
    }
    let self = this;
    let tasks = [];
    let UploadTask = function(helper) {
      this.upload = function(callback) {
        if (helper instanceof DirectoryCreationHelper) {
          helper.create(callback);
        } else {
          helper.upload(callback);
        }
      };
      return this.upload;
    };
    this.queue.every(function(helper) {
      tasks.push(new UploadTask(helper));
      return true
    });
    async.series(tasks, function(err) {
      if (err && self.onError) {
        return self.onError(err);
      }
    });
  }

  add(helper) {
    this.queue.push(helper);
  }
}

class DirectoryCreationHelper {
  constructor(networkPath, isPrivate, uploader) {
    this.networkPath = networkPath;
    this.isPrivate = isPrivate;
    this.uploader = uploader;
  }

  create(callback) {
    console.log('DIR :', this.networkPath);
    this.uploader.progressListener.onSuccess(0, this.networkPath);
    this.uploader.api.createDir(this.networkPath, this.isPrivate, null, false, callback);
  }
}

export class DirectoryHelper {
  constructor(uploader, isPrivate, localPath, networkParentDirPath) {
    var self = this;
    this.uploader = uploader;
    this.isPrivate = isPrivate;
    this.localPath = localPath;
    this.networkParentDirPath = networkParentDirPath;
    this.onError = function(err) {
      self.uploader.onError('Failed to create directory ' + networkParentDirPath);
    };
    this.taskQueue = new TaskQueue(this.onError);
  }

  _createTasks(localPath, networkPath) {
    let stat;
    let tempPath;
    let contents = fs.readdirSync(localPath);
    for (var i in contents) {
      tempPath = localPath + '/' + contents[i];
      stat = fs.statSync(tempPath);
      if (stat.isDirectory()) {
        let dirPath = networkPath + '/' + contents[i];
        this.taskQueue.add(new DirectoryCreationHelper(dirPath, this.isPrivate, this.uploader));
        this._createTasks(tempPath, dirPath);
      } else {
        this.taskQueue.add(new FileHelper(this.uploader, tempPath, networkPath));
      }
    }
  }

  upload() {
    let stat = fs.statSync(this.localPath);
    if (stat.isDirectory()) {
      let networkPath = this.networkParentDirPath || '/';
      this.taskQueue.add(new DirectoryCreationHelper(this.networkParentDirPath, this.isPrivate, this.uploader));
      this._createTasks(this.localPath, this.networkParentDirPath);
    } else {
      this.taskQueue.add(new FileHelper(this.uploader, this.localPath, this.networkParentDirPath));
    }
    this.taskQueue.run();
  }
}
