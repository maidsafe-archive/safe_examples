import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { I18n } from 'react-redux-i18n';

import * as Task from './tasks';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

class TaskQueue {

  constructor(callback) {
    this.callback = callback;
    this.queue = [];
    this.cancelled = false;
  }

  add(task) {
    this.queue.push(task);
  }

  run() {
    let index = 0;
    const next = (err, status) => {
      if (!this.cancelled) {
        this.callback(err, status);
      }
      index += 1;
      if (this.queue.length === index) {
        return this.callback(undefined, undefined, true);
      }
      if (!this.cancelled) {
        this.queue[index].execute(next);
      }
    };
    this.queue[index].execute(next);
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
      return;
    }
    tempPath = `${localPath}/${contents[i]}`;
    stat = fs.statSync(tempPath);
    if (stat.isDirectory()) {
      tempStat = getDirectoryStats(tempPath);
      stats.size += tempStat.size;
      stats.files += tempStat.files;
      stats.directories += tempStat.directories;
    } else {
      if (stat.size > MAX_FILE_SIZE) {
        throw new Error(I18n.t('messages.restrictedFileSize', { size: (MAX_FILE_SIZE / 1000000) }));
      }
      stats.files += 1;
      stats.size += stat.size;
    }
  }
  return stats;
};

export const generateUploadTaskQueue = (localPath, networkPath, callback) => {
  let stat;
  let tempPath;
  const taskQueue = callback instanceof TaskQueue ? callback : new TaskQueue(callback);
  const nextDir = `${networkPath}/${path.basename(localPath)}`;
  const contents = fs.readdirSync(localPath);
  for (let i = 0; i < contents.length; i += 1) {
    if (!contents[i]) {
      return;
    }
    tempPath = `${localPath}/${contents[i]}`;
    stat = fs.statSync(tempPath);
    if (stat.isDirectory()) {
      generateUploadTaskQueue(tempPath, nextDir, taskQueue);
    } else {
      taskQueue.add(new Task.FileUploadTask(tempPath, `${nextDir}/${contents[i]}`));
    }
  }
  return taskQueue;
};

export const hashString = (str) => (
  crypto.createHash('sha256').update(str).digest()
);

export const strToPtrBuf = (str) => {
  const buf = new Buffer(str);
  return { ptr: buf, len: buf.length };
};

export const randomStr = () => (
  crypto.randomBytes(50).toString('hex')
);

export const parseUrl = (url) => (
  (url.indexOf('safe-auth://') === -1) ? url.replace('safe-auth:', 'safe-auth://') : url
);
