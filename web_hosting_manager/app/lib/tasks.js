import fs from 'fs';
import { I18n } from 'react-redux-i18n';
import { safe, typetag, accessContainers } from './api';

const parseContainerPath = (targetPath) => {
  if (!targetPath) {
    return null;
  }
  const split = targetPath.split('/');
  return {
    target: split.slice(0, 3).join('/'),
    file: targetPath.split('/').slice(4).join('/')
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

    return safe.auth.getAccessContainerInfo(accessContainers.public)
      .then((mdata) => mdata.get(containerPath.target))
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
