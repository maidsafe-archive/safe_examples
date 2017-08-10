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
  let fileName = targetPath.split('/').slice(3).join('/');

  return {
    target: split.slice(0, 3).join('/'),
    file: fileName || path.basename(targetPath)
  };
};

class Task {

  execute(callback) {
    const error = new Error(I18n.t('messages.notImplemented'));
    callback(error);
  }
}

export class FileUploadTask extends Task {

  constructor(localPath, networkPath) {
    super();
    this.localPath = localPath;
    this.networkPath = networkPath;
  }

  execute(callback) {
    const app = safeApi.app;
    if (!app) {
      return callback(new Error('App not registered'));
    }
    const containerPath = parseContainerPath(this.networkPath);

    return safeApi.getPublicContainer()
      .then((md) => safeApi.getMDataValueForKey(md, containerPath.target))
      .then((val) => app.mutableData.newPublic(val, CONSTANTS.TAG_TYPE.WWW))
      .then((mdata) => {
        const nfs = mdata.emulateAs('NFS');
        return nfs.open()
              .then(file => {
                  return new Promise((resolve, reject) => {
                    // QUESTION: Is it possible to get file size from openSync?
                    // That's the only reason I'm using readFileSync
                     const fd = fs.openSync(this.localPath, 'r');
                     const fileContents = fs.readFileSync(this.localPath);
                     let offset = 0;
                     const size = fileContents.length;
                     const MAX_SIZE = 1000000;
                     let chunkSize = 1000;
                     let buffer = null;
                     const writeFile = () => {
                         chunkSize = size - offset;
                         chunkSize = (chunkSize < MAX_SIZE) ? chunkSize : (offset + MAX_SIZE)
                         buffer = new Buffer(chunkSize);
                         fs.readSync(fd, buffer, 0, chunkSize, offset);
                         file.write(buffer)
                              .then(() => {
                                      offset += chunkSize;
                                      // Update progress bar
                                      callback(null, {
                                        isFile: true,
                                        isCompleted: false,
                                        size: offset
                                      })
                                      offset === size ? file.close().then(() => resolve(file)) : writeFile();
                               })
                               .catch(err => reject(err));
                     };
                     writeFile();
                  });
               })
              .then((file) => nfs.insert(containerPath.file, file)
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
        size: fs.statSync(this.localPath).size
      }))
      .catch(callback);
  }
}
