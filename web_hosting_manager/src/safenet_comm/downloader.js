import fs from 'fs';
import path from 'path';
import { shell } from 'electron';

import { getPath } from './temp';
import CONSTANTS from '../constants';
import { nodeEnv, parseNetworkPath } from './helpers';

// private variables
const _safeApi = Symbol('safeApi');
const _nwPath = Symbol('nwPath');
const _cb = Symbol('cb');
const _cancelled = Symbol('cancelled');
const _totalBytes = Symbol('totalBytes');
const _bytesRead = Symbol('bytesRead');
const _filePath = Symbol('filePath');

export default class Downloader {
  constructor(safeApi, nwPath, cb) {
    this[_safeApi] = safeApi;
    this[_nwPath] = nwPath;
    this[_cb] = cb;
    this[_cancelled] = false;
    this[_totalBytes] = 0;
    this[_bytesRead] = 0;
    this[_filePath] = null;
  }

  start() {
    const containerPath = parseNetworkPath(this[_nwPath]);
    const tokens = this[_nwPath].split('/');
    this[_filePath] = path.join(getPath(), tokens.pop());

    return new Promise(async (resolve) => {
      try {
        const pubCntr = await this[_safeApi].getPublicContainer();
        const servFolderName = await this[_safeApi].getMDataValueForKey(pubCntr, containerPath.dir);
        const servFolder = await this[_safeApi].getServiceFolderMD(servFolderName);

        const nfs = servFolder.emulateAs('NFS');
        let file = await nfs.fetch(containerPath.file);
        file = await nfs.open(file, CONSTANTS.FILE_OPEN_MODE.OPEN_MODE_READ);
        this[_totalBytes] = await file.size();

        await this._readFileInChunks(file);
        resolve();
      } catch (err) {
        this[_cb](err);
      }
    });
  }

  cancel() {
    this[_cancelled] = true;
  }

  _readFileInChunks(file) {
    return new Promise(async (resolve, reject) => {
      try {
        let isCompleted = false;
        do {
          if (this[_cancelled]) {
            break;
          }

          const bytesLeft = this[_totalBytes] - this[_bytesRead];
          const bytesLen = (bytesLeft < CONSTANTS.DOWNLOAD_CHUNK_SIZE) ?
            bytesLeft : CONSTANTS.DOWNLOAD_CHUNK_SIZE;

          const data = await file.read(this[_bytesRead], bytesLen);

          this._writeTempFile(data);

          this[_bytesRead] = this[_bytesRead] + bytesLen;
          isCompleted = (this[_bytesRead] === this[_totalBytes]);
          this[_cb](null, {
            progress: Math.floor((this[_bytesRead] / this[_totalBytes]) * 100),
            completed: isCompleted,
          });
        } while (!isCompleted);

        if (!this[_cancelled] && nodeEnv !== CONSTANTS.ENV.TEST) {
          shell.showItemInFolder(this[_filePath]);
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  _writeTempFile(data) {
    fs.appendFileSync(this[_filePath], data);
  }
}
