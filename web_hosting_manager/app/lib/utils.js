import { shell } from 'electron';
import keytar from 'keytar';
import fs from 'fs';
import path from 'path';
import { I18n } from 'react-redux-i18n';

import * as Task from './tasks';
import CONSTANTS from './constants';

class LocalAuthInfo {
  constructor() {
    this.SERVICE = CONSTANTS.KEY_TAR.SERVICE;
    this.ACCOUNT = CONSTANTS.KEY_TAR.ACCOUNT;
  }
  save(info) {
    return keytar.addPassword(this.SERVICE, this.ACCOUNT, JSON.stringify(info));
  }
  get() {
    return keytar.getPassword(this.SERVICE, this.ACCOUNT);
  }
  clear() {
    return keytar.deletePassword(this.SERVICE, this.ACCOUNT);
  }
}

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

const parseUrl = (url) => (
  (url.indexOf('safe-auth://') === -1) ? url.replace('safe-auth:', 'safe-auth://') : url
);

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
      if (stat.size > CONSTANTS.MAX_FILE_SIZE) {
        throw new Error(I18n.t('messages.restrictedFileSize', { size: (CONSTANTS.MAX_FILE_SIZE / 1000000) }));
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

export const openExternal = (url) => (
  shell.openExternal(parseUrl(url))
);

export const localAuthInfo = new LocalAuthInfo();
