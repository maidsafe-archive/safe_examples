import fs from 'fs';
import { I18n } from 'react-redux-i18n';
import { safe, typetag, createContainer } from './api';
import { strToPtrBuf, randomStr, parseConatinerPath } from './utils';

class Task {

  execute(callback) {
    const error = new Error(I18n.t('messages.notImplemented'));
    callback(error);
  }
}

export class DirCreationTask extends Task {

  constructor(dirPath) {
    super();
    this.dirPath = dirPath;
  }

  execute(callback) {
    createContainer(this.dirPath)
      .then((res) => callback(null, {
        isFile: false,
        isCompleted: true,
        size: 0
      }))
      .catch(callback);
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
    const containerPath = parseConatinerPath(this.networkPath);

    return safe.auth.canAccessContainer('_public')
      .then((hasAccess) => {
        if (!hasAccess) {
          return Promise.reject(new Error('No access to _public container'));
        }
      })
      .then(() => safe.auth.getAccessContainerInfo('_public'))
      .then((mdata) => mdata.get(containerPath.dir))
      .then((val) => safe.mutableData.newPublic(val.buf, typetag))
      .then((mdata) => {
        const nfs = mdata.emulateAs('NFS');
        return nfs.create(fs.readFileSync(this.localPath))
          .then((file) => nfs.insert(containerPath.file, file));
      })
      .then(() => callback(null, {
        isFile: true,
        isCompleted: true,
        size: fs.statSync(this.localPath).size
      }))
      .catch(callback);
  }
}
