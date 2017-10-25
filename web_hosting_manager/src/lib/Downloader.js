import fs from 'fs';
import path from 'path';
import { shell } from 'electron';

import { getPath } from './temp';
import CONSTANTS from '../constants';
import { nodeEnv } from './utils';

export default class Downloader {
  constructor(api, networkPath, callback) {
    this.api = api;
    this.path = networkPath;
    this.callback = callback;
    this.cancelled = false;
    this.totalSize = 0;
    this.sizeRead = 0;
    this.byteLen = CONSTANTS.DOWNLOAD_CHUNK_SIZE;
    this.filePath = null;
  }

  start() {
    const self = this;
    const containerPath = {
      dir: this.path.split('/').slice(0, 3).join('/'),
      file: this.path.split('/').slice(3).join('/'),
    };
    const tokens = this.path.split('/');
    this.filePath = path.join(getPath(), tokens.pop());

    const writeTempFile = (file) => {
      let readWriteFile = null;
      return new Promise(async (resolve, reject) => {
        try {
          const writeCb = (err) => {
            if (err) {
              return reject(err);
            }
            self.callback(null, {
              progress: Math.floor((self.sizeRead / self.totalSize) * 100),
              completed: false,
            });
            if (self.byteLen < CONSTANTS.DOWNLOAD_CHUNK_SIZE) {
              return resolve();
            }
            self.sizeRead = self.sizeRead + CONSTANTS.DOWNLOAD_CHUNK_SIZE;
            return readWriteFile();
          };
          readWriteFile = async () => {
            if (this.cancelled) {
              return resolve();
            }
            const restBytes = this.totalSize - this.sizeRead;
            this.byteLen = (restBytes < CONSTANTS.DOWNLOAD_CHUNK_SIZE) ?
              restBytes : CONSTANTS.DOWNLOAD_CHUNK_SIZE;

            const data = await file.read(self.sizeRead, self.byteLen);
            if (self.sizeRead === 0) {
              return fs.writeFile(self.filePath, data, writeCb);
            }
            fs.appendFile(self.filePath, data, writeCb);
          };
          await readWriteFile();
          if (nodeEnv !== CONSTANTS.ENV.TEST) {
            shell.showItemInFolder(self.filePath);
          }
          self.callback(null, {
            progress: 100,
            completed: true,
          });
          resolve();
        } catch(err) {
          reject(err);
        }
      });
    };

    return new Promise(async (resolve) => {
      try {
        const pubCntr = await this.api.getPublicContainer();
        const servFolderName = await this.api.getMDataValueForKey(pubCntr, containerPath.dir);
        const servFolder = await this.api.getServiceFolderMD(servFolderName);
        const nfs = servFolder.emulateAs('NFS');
        let file = await nfs.fetch(containerPath.file);
        file = await nfs.open(file, CONSTANTS.FILE_OPEN_MODE.OPEN_MODE_READ);
        const totalSize = await file.size();
        this.totalSize = totalSize;
        await writeTempFile(file);
        resolve();
      } catch(err) {
        this.callback(err);
      }
    });
  }

  cancel() {
    this.cancelled = true;
  }
}
