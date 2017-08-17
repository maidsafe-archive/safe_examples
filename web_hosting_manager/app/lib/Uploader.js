import fs from 'fs';
import path from 'path';
import * as Helper from './utils';
import { FileUploadTask } from './tasks';

const status = Symbol('status');
const errorCb = Symbol('errorCb');
const localPath = Symbol('localPath');
const progressCb = Symbol('progressCb');
const networkPath = Symbol('networkPath');
const dirName = Symbol('dirName');
const taskQueue = Symbol('taskQueue');
const currentTask = Symbol('currentTask');

export default class Uploader {

  constructor(path, networkRootPath, progressCallback, errorCallback) {
    this[localPath] = path;
    this[errorCb] = errorCallback;
    this[networkPath] = networkRootPath;
    this[progressCb] = progressCallback;
    this[status] = {
      total: undefined,
      completed: undefined,
      uploading: false,
      stopped: false,
      errored: false,
      cancelled: false
    };
    this[currentTask] = undefined;
  }

  start() {
    this[status].uploading = true;
    const stat = fs.statSync(this[localPath]);
    const callback = (error, taskStatus) => {
      if (error) {
        this[status].errored = true;
        return this[errorCb](error);
      }
      if (taskStatus && taskStatus.isCompleted) {
        this[status].completed.files += taskStatus.isFile ? 1 : 0;
        this[status].completed.directories += taskStatus.isFile ? 0 : 1;
      }

      this[status].completed.size += taskStatus ? taskStatus.size : 0;

      const progress = Math.floor((this[status].completed.size / this[status].total.size) * 100);

      return this[progressCb]({
        total: this[status].total,
        completed: this[status].completed,
        progress
      }, progress === 100);
    };
    if (stat.isDirectory()) {
      this[status].total = Helper.getDirectoryStats(this[localPath]);
      this[status].completed = new Helper.DirStats();
      this[taskQueue] = Helper.generateUploadTaskQueue(this[localPath],
        this[networkPath], callback);
      this[taskQueue].run();
    } else {
      const fileName = path.basename(this[localPath]);
      this[currentTask] = new FileUploadTask(this[localPath], `${this[networkPath]}/${fileName}`);
      this[status].total = new Helper.DirStats();
      this[status].total.size = fs.statSync(this[localPath]).size;
      this[status].completed = new Helper.DirStats();
      this[status].total.files = 1;
      this[currentTask].execute(callback);
    }
  }

  cancel() {
    if(this[taskQueue]) {
      this[taskQueue].cancel();
    } else {
      this[currentTask].cancelled = true;
    }
    this[status].cancelled = true;
  }

}
