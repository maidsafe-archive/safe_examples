import fs from 'fs';
import path from 'path';
import { I18n } from 'react-redux-i18n';
import * as Helper from './utils';
import { FileUploadTask } from './tasks';
import CONSTANTS from '../constants';

const _safeApi = Symbol('safeApi');
const _localPath = Symbol('localPath');
const _nwPath = Symbol('nwPath');
const _status = Symbol('status');
const _errorCb = Symbol('errorCb');
const _progressCb = Symbol('progressCb');
const _taskQueue = Symbol('taskQueue');
const _taskCb = Symbol('taskCb');
const _cancelOnErrs = Symbol('cancelOnErrs');
const _currentTask = Symbol('currentTask');

export default class Uploader {
  constructor(api, localPath, nwPath, progressCb, errorCb) {
    this[_safeApi] = api;
    this[_localPath] = localPath;
    this[_nwPath] = nwPath;
    this[_progressCb] = progressCb;
    this[_errorCb] = errorCb;
    this[_status] = {
      total: new Helper.DirStats(),
      completed: new Helper.DirStats(),
      cancelled: false,
    };
    this[_taskQueue] = undefined;
    this[_taskCb] = undefined;
    this[_currentTask] = undefined;
    this[_cancelOnErrs] = [
      CONSTANTS.ERROR_CODE.TOO_MANY_ENTRIES,
      CONSTANTS.ERROR_CODE.LOW_BALANCE,
    ];
  }

  start() {
    this[_status].uploading = true;
    const stat = fs.statSync(this[_localPath]);
    this[_taskCb] = (error, taskStatus) => {
      if (error) {
        this[_errorCb](error);
        if (cancelUploadErrArr.indexOf(error.code) !== -1) {
          this.cancel();
          return this[_progressCb]({
            total: 0,
            completed: 0,
            progress: 0,
          }, true);
        }
        return;
      }
      if (taskStatus && taskStatus.isCompleted) {
        this[_status].completed.files += taskStatus.isFile ? 1 : 0;
        this[_status].completed.directories += taskStatus.isFile ? 0 : 1;
      }

      this[_status].completed.size += taskStatus ? taskStatus.size : 0;

      const completedSize = this[_status].completed.size || 1;
      const totalSize = this[_status].total.size || 1;

      const progress = Math.floor((completedSize / totalSize) * 100);
      return this[_progressCb]({
        total: this[_status].total,
        completed: this[_status].completed,
        progress,
      }, progress === 100);
    };

    if (stat.isDirectory()) {
      this._handleDir();
      return;
    }
    this._handleFile();
  }

  cancel() {
    if (this[_taskQueue]) {
      this[_taskQueue].cancel();
    } else {
      this[_currentTask].cancelled = true;
    }
    this[_status].cancelled = true;
  }

  _handleDir() {
    const baseDir = path.basename(this[_localPath]);
    this[_status].total = Helper.getDirectoryStats(this[_localPath]);
    // const taskQ = new TaskQueue(this[_taskCb]);
    // this[_taskQueue] = Helper.generateUploadTaskQueue(
    //   this[_safeApi],
    //   this[_localPath],
    //   this[_nwPath],
    //   taskQ,
    //   baseDir,
    // );
    // this[_taskQueue].run();
    const items = Helper.readDir(this[_localPath]).sort().map(item => item.slice(this[_localPath].length + 1));
    console.log('items', items);
  }

  _handleFile() {
    const fileName = path.basename(this[_localPath]);
    this[_currentTask] = new FileUploadTask(this[_safeApi], this[_localPath], `${this[_nwPath]}/${fileName}`);
    this[_status].total.size = fs.statSync(this[_localPath]).size;
    this[_status].total.files = 1;
    if (this[_status].total.size > CONSTANTS.MAX_FILE_SIZE) {
      this[_taskCb](new Error(I18n.t('messages.restrictedFileSize', { size: (CONSTANTS.MAX_FILE_SIZE / 1000000) })));
      return this[_progressCb]({
        total: 0,
        completed: 0,
        progress: 0,
      }, true);
    }
    this[_currentTask].execute(callback);
  }

}
