import fs from 'fs';
import path from 'path';
import env from '../env';
import async from 'async';
import FileHelper from './file_helper';

export let getDirectoryStats = function(localPath) {
  let size = 0;
  let stat;
  let tempStat;
  let tempPath;
  let stats = {
    size: 0,
    files: 0,
    directories: 0
  };
  try {
    let contents = fs.readdirSync(localPath);
    for (var i in contents) {
      tempPath = localPath + '/' + contents[i];
      stat = fs.statSync(tempPath);
      if (stat.isDirectory()) {
        tempStat = getDirectoryStats(tempPath);
        stats.size += tempStat.size;
        stats.files += tempStat.files;
        stats.directories += tempStat.directories;
      } else {
        if (env.isFileUploadSizeRestricted && stat.size > env.maxFileUploadSize) {
          throw new Error('File larger  than ' + (env.maxFileUploadSize / 1000000) + ' Mb can not be uploaded');
        }
        stats.files++;
        stats.size += stat.size;
      }
    }
    return stats;
  } catch (e) {
    throw new Error(e.message);
  }
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
        if (helper.uploader.isAborted) {
          return callback('Task was cancelled');
        }
        if (helper instanceof DirectoryCreationHelper) {
          helper.create(callback);
        } else {
          helper.uploader.currentFileHelperInstance = helper;
          helper.upload(callback);
        }
      };
      return this.upload;
    };
    this.queue.every(function(helper) {
      tasks.push(new UploadTask(helper));
      return true;
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
      self.uploader.onError('Task was not completed successfully' + '\n' + (err.data ? err.data.description : err));
    };
    this.taskQueue = new TaskQueue(this.onError);
  }

  /* jscs:disable disallowDanglingUnderscores*/
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
  /* jscs:enable disallowDanglingUnderscores*/
  upload() {
    let stat = fs.statSync(this.localPath);
    if (stat.isDirectory()) {
      let networkPath = this.networkParentDirPath || '/';
      this.taskQueue.add(new DirectoryCreationHelper(this.networkParentDirPath, this.isPrivate, this.uploader));
      /* jscs:disable disallowDanglingUnderscores*/
      this._createTasks(this.localPath, this.networkParentDirPath);
      /* jscs:enable disallowDanglingUnderscores*/
    } else {
      this.taskQueue.add(new FileHelper(this.uploader, this.localPath, this.networkParentDirPath));
    }
    this.taskQueue.run();
  }

  cancel() {
    if (this.uploader.currentFileHelperInstance) {
      this.uploader.currentFileHelperInstance.cancel();
    }
  }
}
