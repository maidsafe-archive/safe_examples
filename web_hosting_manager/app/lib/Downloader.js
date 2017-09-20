import fs from 'fs';
import path from 'path';
import { getPath } from './temp';
import { shell } from 'electron';
import safeApi from './api';
import CONSTANTS from '../constants';

export default class Downloader {
  constructor(networkPath, callback) {
    this.path = networkPath;
    this.callback = callback;
    this.cancelled = false;
    this.totalSize = 0;
    this.sizeRead = 0;
    this.byteLen = CONSTANTS.DOWNLOAD_CHUNK_SIZE;
    this.filePath = null;
  }

  start() {
    const app = safeApi.app;
    const containerPath = {
      dir: this.path.split('/').slice(0, 3).join('/'),
      file: this.path.split('/').slice(3).join('/')
    };
    const tokens = this.path.split('/');
    this.filePath = path.join(getPath(), tokens.pop());

    return safeApi.getPublicContainer()
      .then((md) => safeApi.getMDataValueForKey(md, containerPath.dir))
      .then((val) => app.mutableData.newPublic(val, CONSTANTS.TAG_TYPE.WWW))
      .then((mdata) => {
        const nfs = mdata.emulateAs('NFS');
        return nfs.fetch(containerPath.file)
          .then((file) => nfs.open(file, CONSTANTS.FILE_OPEN_MODE.OPEN_MODE_READ))
          .then((f) => f.size().then((totalSize) => {
            this.totalSize = totalSize;
            let readWriteFile = null;
            return new Promise((resolve, reject) => {
              const writeCb = (err) => {
                if (err) {
                  return reject(err);
                }
                this.callback(null, {
                  progress: Math.floor((this.sizeRead / this.totalSize) * 100),
                  completed: false
                });
                if (this.byteLen < CONSTANTS.DOWNLOAD_CHUNK_SIZE) {
                  return resolve();
                }
                this.sizeRead = this.sizeRead + CONSTANTS.DOWNLOAD_CHUNK_SIZE;
                return readWriteFile();
              };

              // read file in chunk
              readWriteFile = () => {
                if (this.cancelled) {
                  return resolve();
                }
                const restBytes = this.totalSize - this.sizeRead;
                this.byteLen = (restBytes < CONSTANTS.DOWNLOAD_CHUNK_SIZE) ?  restBytes : CONSTANTS.DOWNLOAD_CHUNK_SIZE;
                return f.read(this.sizeRead, this.byteLen)
                  .then((data) => {
                    if (this.sizeRead === 0) {
                      return fs.writeFile(this.filePath, data, writeCb);
                    }
                    return fs.appendFile(this.filePath, data, writeCb);
                  }).catch(reject);
              };
              return readWriteFile();
            });
          }));
      })
      .then(() => {
        shell.showItemInFolder(this.filePath);
        this.callback(null, {
          progress: 100,
          completed: true
        });
      })
      .catch(this.callback);
  }

  cancel() {
    this.cancelled = true;
  }
}
