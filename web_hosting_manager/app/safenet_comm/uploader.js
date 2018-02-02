import fs from 'fs';
import path from 'path';
import { I18n } from 'react-redux-i18n';
import * as Helper from './helpers';
import CONSTANTS from '../constants';
import log from '../logging';

const _safeApi = Symbol('safeApi');
const _localPath = Symbol('localPath');
const _nwPath = Symbol('nwPath');
const _status = Symbol('status');
const _errorCb = Symbol('errorCb');
const _progressCb = Symbol('progressCb');
const _dirTasks = Symbol('dirTasks');
const _fileTask = Symbol('fileTask');
const _taskCb = Symbol('taskCb');
const _cancelOnErrs = Symbol('cancelOnErrs');

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
    this[_dirTasks] = undefined;
    this[_fileTask] = undefined;
    this[_taskCb] = undefined;
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
        if (this[_cancelOnErrs].indexOf(error.code) !== -1) {
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
    if (this[_dirTasks]) {
      this[_dirTasks].cancel();
    } else {
      this[_fileTask].cancelled = true;
    }
    this[_status].cancelled = true;
  }

  _handleDir() {
    log.info('Uploading directory...');
    this[_status].total = Helper.getDirectoryStats(this[_localPath]);
    const items = Helper.readDir(this[_localPath])
      .sort()
      .map(item => item.slice(this[_localPath].length + 1));
    this[_dirTasks] = new Helper.TaskQueue(this[_taskCb]);

    if (items.length === 0) {
      this[_dirTasks].add(new Helper.EmptyDirTask());
    } else {
      for (const item of items) {
        this[_dirTasks].add(new Helper.FileUploadTask(
          this[_safeApi],
          path.join(this[_localPath], item),
          path.join(this[_nwPath], item)
        ));
      }
    }
    this[_dirTasks].run();
  }

  _handleFile() {
    log.info('Uploading file...');
    const fileName = path.basename(this[_localPath]);
    this[_status].total.size = fs.statSync(this[_localPath]).size;
    if (this[_status].total.size > CONSTANTS.MAX_FILE_SIZE) {
      this[_taskCb](new Error(I18n.t('messages.restrictedFileSize', { size: (CONSTANTS.MAX_FILE_SIZE / 1000000) })));
      return this[_progressCb]({
        total: 0,
        completed: 0,
        progress: 0,
      }, true);
    }
    this[_status].total.files = 1;
    this[_fileTask] = new Helper.FileUploadTask(this[_safeApi], this[_localPath], `${this[_nwPath]}/${fileName}`);
    this[_fileTask].execute(this[_taskCb]);
  }
}
