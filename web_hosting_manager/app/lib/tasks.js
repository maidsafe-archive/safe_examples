import path from 'path';
import fs from 'fs';
import { I18n } from 'react-redux-i18n';
import { safe, TAG_TYPE_WWW, accessContainers } from './api';

const parseContainerPath = (targetPath) => {
  if (!targetPath) {
    return null;
  }
  const split = targetPath.split('/');
  return {
    target: split.slice(0, 3).join('/'),
    file: targetPath.split('/').slice(4).join('/') || path.basename(targetPath)
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
    if (!safe) {
      return callback(new Error('App not registered'));
    }
    const containerPath = parseContainerPath(this.networkPath);

    return safe.auth.getContainer(accessContainers.public)
      .then((mdata) => mdata.encryptKey(containerPath.target).then((encKey) => mdata.get(encKey)).then((value) => mdata.decrypt(value.buf)))
      .then((val) => safe.mutableData.newPublic(val, TAG_TYPE_WWW))
      .then((mdata) => {
        const nfs = mdata.emulateAs('NFS');
        return nfs.create(fs.readFileSync(this.localPath))
          .then((file) => nfs.insert(containerPath.file, file)
            .catch((err) => {
              if (err.code === -106) {
                return Promise.reject(err);
              }
              return mdata.get(containerPath.file)
                .then((value) => {
                  if (value.buf.length !== 0) {
                    return Promise.reject(err);
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

