import fs from 'fs';
import { shell } from 'electron';
import { I18n } from 'react-redux-i18n';

import * as Task from './tasks';
import CONSTANTS from '../constants';

class TaskQueue {
  constructor(callback) {
    this.callback = callback;
    this.queue = [];
    this.cancelled = false;
    this.index = 0;
  }

  add(task) {
    this.queue.push(task);
  }

  run() {
    const next = (err, status) => {
      if (!this.cancelled) {
        this.callback(err, status);
      } else {
        this.queue[this.index].cancelled = true;
      }
      if (status && !status.isCompleted) {
        return;
      }
      this.index += 1;
      if (this.queue.length === (this.index - 1)) {
        const taskStatus = {
          isFile: true,
          isCompleted: true,
          size: 0,
        };
        this.callback(null, taskStatus);
        return;
      }
      if (!this.cancelled && this.queue[this.index]) {
        this.queue[this.index].execute(next);
      }
    };

    if (this.queue[this.index]) {
      this.queue[this.index].execute(next);
    }
  }

  cancel() {
    this.cancelled = true;
  }
}

export class DirStats {
  constructor() {
    this.size = 0;
    this.files = 0;
    this.directories = 0;
  }
}

export const getDirectoryStats = (localPath) => {
  let stat;
  let tempStat;
  let tempPath;
  const stats = new DirStats();
  const contents = fs.readdirSync(localPath);
  stats.directories += 1;
  for (let i = 0; i < contents.length; i += 1) {
    if (!contents[i]) {
      return false;
    }
    tempPath = `${localPath}/${contents[i]}`;
    stat = fs.statSync(tempPath);
    if (stat.isDirectory()) {
      tempStat = getDirectoryStats(tempPath);
      stats.size += tempStat.size;
      stats.files += tempStat.files;
      stats.directories += tempStat.directories;
    } else {
      if (stat.size > CONSTANTS.MAX_FILE_SIZE) {
        throw new Error(I18n.t('messages.restrictedFileSize', { size: (CONSTANTS.MAX_FILE_SIZE / 1000000) }));
      }
      stats.files += 1;
      stats.size += stat.size;
    }
  }
  return stats;
};

export const generateUploadTaskQueue = (api, localPath, networkPath, callback, baseDir) => {
  let stat;
  let tempPath;
  const taskQueue = callback instanceof TaskQueue ? callback : new TaskQueue(callback);
  let nextDir = null;
  const contents = fs.readdirSync(localPath);

  let updatedLocation = networkPath;

  if (baseDir) {
    updatedLocation = `${networkPath}/${baseDir}`;
  }

  tempPath = `${localPath}`;

  for (let i = 0; i < contents.length; i += 1) {
    if (!contents[i]) {
      return false;
    }
    tempPath = `${localPath}/${contents[i]}`;
    stat = fs.statSync(tempPath);

    if (stat.isDirectory()) {
      nextDir = `${updatedLocation}/${contents[i]}`;
      generateUploadTaskQueue(api, tempPath, nextDir, taskQueue);
    } else {
      taskQueue.add(new Task.FileUploadTask(api, tempPath, `${updatedLocation}/${contents[i]}`));
    }
  }

  if (baseDir && contents.length === 0) {
    taskQueue.add(new Task.EmptyDirTask());
  }
  return taskQueue;
};

const parseUrl = url => (
  (url.indexOf('safe-auth://') === -1) ? url.replace('safe-auth:', 'safe-auth://') : url
);

export const openExternal = url => (
  shell.openExternal(parseUrl(url))
);

export const nodeEnv = process.env.NODE_ENV || CONSTANTS.DEV_ENV;
