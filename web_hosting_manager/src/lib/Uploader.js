import fs from 'fs';
import path from 'path';
import { I18n } from 'react-redux-i18n';
import * as Helper from './utils';
import { FileUploadTask } from './tasks';
import CONSTANTS from '../constants';

const safeApi = Symbol('safeApi');
const status = Symbol('status');
const errorCb = Symbol('errorCb');
const localPath = Symbol('localPath');
const progressCb = Symbol('progressCb');
const networkPath = Symbol('networkPath');
const taskQueue = Symbol('taskQueue');
const currentTask = Symbol('currentTask');

export default class Uploader {
  constructor(api, pathLocal, networkRootPath, progressCallback, errorCallback) {
    this[safeApi] = api;
    this[localPath] = pathLocal;
    this[errorCb] = errorCallback;
    this[networkPath] = networkRootPath;
    this[progressCb] = progressCallback;
    this[status] = {
      total: undefined,
      completed: undefined,
      uploading: false,
      stopped: false,
      errored: false,
      cancelled: false,
    };
    this[currentTask] = undefined;
  }

  start() {
    this[status].uploading = true;
    const stat = fs.statSync(this[localPath]);
    const baseDir = path.basename(this[localPath]);
    const cancelUploadErrArr = [
      CONSTANTS.ERROR_CODE.TOO_MANY_ENTRIES,
      CONSTANTS.ERROR_CODE.LOW_BALANCE,
    ];
    const callback = (error, taskStatus) => {
      if (error) {
        this[status].errored = true;
        this[errorCb](error);
        if (cancelUploadErrArr.indexOf(error.code) !== -1) {
          this.cancel();
          return this[progressCb]({
            total: 0,
            completed: 0,
            progress: 0,
          }, true);
        }
        return;
      }
      if (taskStatus && taskStatus.isCompleted) {
        this[status].completed.files += taskStatus.isFile ? 1 : 0;
        this[status].completed.directories += taskStatus.isFile ? 0 : 1;
      }

      this[status].completed.size += taskStatus ? taskStatus.size : 0;

      const completedSize = this[status].completed.size || 1;
      const totalSize = this[status].total.size || 1;

      const progress = Math.floor((completedSize / totalSize) * 100);
      return this[progressCb]({
        total: this[status].total,
        completed: this[status].completed,
        progress,
      }, progress === 100);
    };
    if (stat.isDirectory()) {
      this[status].total = Helper.getDirectoryStats(this[localPath]);
      this[status].completed = new Helper.DirStats();
      this[taskQueue] = Helper.generateUploadTaskQueue(
        this[safeApi],
        this[localPath],
        this[networkPath],
        callback,
        baseDir,
      );
      this[taskQueue].run();
    } else {
      const fileName = path.basename(this[localPath]);
      this[currentTask] = new FileUploadTask(this[safeApi], this[localPath], `${this[networkPath]}/${fileName}`);
      this[status].total = new Helper.DirStats();
      this[status].total.size = fs.statSync(this[localPath]).size;
      this[status].completed = new Helper.DirStats();
      this[status].total.files = 1;
      if (this[status].total.size > CONSTANTS.MAX_FILE_SIZE) {
        callback(new Error(I18n.t('messages.restrictedFileSize', { size: (CONSTANTS.MAX_FILE_SIZE / 1000000) })));
        return this[progressCb]({
          total: 0,
          completed: 0,
          progress: 0,
        }, true);
      }
      this[currentTask].execute(callback);
    }
  }

  cancel() {
    if (this[taskQueue]) {
      this[taskQueue].cancel();
    } else {
      this[currentTask].cancelled = true;
    }
    this[status].cancelled = true;
  }
}
