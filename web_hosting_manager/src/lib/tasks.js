import path from 'path';
import fs from 'fs';
import { I18n } from 'react-redux-i18n';

import safeApi from './api';
import CONSTANTS from '../constants';

const parseContainerPath = (targetPath) => {
  if (!targetPath) {
    return null;
  }
  const split = targetPath.split('/');
  const fileName = targetPath.split('/').slice(3).join('/');

  return {
    target: split.slice(0, 3).join('/'),
    file: fileName || path.basename(targetPath),
  };
};

class Task {
  /* eslint-disable class-methods-use-this */
  execute(callback) {
    /* eslint-enable class-methods-use-this */
    const error = new Error(I18n.t('messages.notImplemented'));
    callback(error);
  }
}

export class EmptyDirTask {
  constructor() {
    this.errorMsg = 'Uploading empty folders is not supported/allowed';
  }

  execute(callback) {
    const error = new Error(this.errorMsg);
    error.code = CONSTANTS.ERROR_CODE.EMPTY_DIR;
    callback(error, { isFile: false, isCompleted: true, size: 1 });
  }
}

export class FileUploadTask extends Task {
  constructor(localPath, networkPath) {
    super();
    this.localPath = localPath;
    this.networkPath = networkPath;
    this.cancelled = false;
  }

  execute(callback) {
    const { app } = safeApi;
    if (!app) {
      return callback(new Error('App not registered'));
    }
    const containerPath = parseContainerPath(this.networkPath);
    const fileStats = fs.statSync(this.localPath);

    return safeApi.getPublicContainer()
      .then(md => safeApi.getMDataValueForKey(md, containerPath.target))
      .then(val => app.mutableData.newPublic(val, CONSTANTS.TAG_TYPE.WWW))
      .then((mdata) => {
        const nfs = mdata.emulateAs('NFS');
        return nfs.open()
          .then(file => (
            new Promise((resolve, reject) => {
              const fd = fs.openSync(this.localPath, 'r');
              let offset = 0;
              const { size } = fileStats;
              let chunkSize = CONSTANTS.UPLOAD_CHUNK_SIZE;
              let buffer = null;
              const writeFile = (remainingBytes) => {
                if (this.cancelled) {
                  return reject(new Error());
                }

                if (remainingBytes < chunkSize) {
                  chunkSize = remainingBytes;
                }

                buffer = Buffer.alloc(chunkSize);
                fs.readSync(fd, buffer, 0, chunkSize, offset);
                return file.write(buffer)
                  .then(() => {
                    offset += chunkSize;
                    remainingBytes -= chunkSize;

                    if (offset === size) {
                      callback(null, {
                        isFile: true,
                        isCompleted: false,
                        size: chunkSize,
                      });
                      return file.close().then(() => resolve(file));
                    }
                    callback(null, {
                      isFile: true,
                      isCompleted: false,
                      size: chunkSize,
                    });
                    return writeFile(remainingBytes);
                  })
                  .catch(err => reject(err));
              };
              writeFile(size);
            })
          ))
          .then(file => nfs.insert(containerPath.file, file)
            .catch((err) => {
              if (err.code !== CONSTANTS.ERROR_CODE.ENTRY_EXISTS) {
                return callback(err);
              }
              return mdata.get(containerPath.file)
                .then((value) => {
                  if (value.buf.length !== 0) {
                    return callback(err);
                  }
                  return nfs.update(containerPath.file, file, value.version + 1);
                });
            }));
      })
      .then(() => callback(null, {
        isFile: true,
        isCompleted: true,
        size: 0,
      }))
      .catch(callback);
  }
}
