import fs from 'fs';
import path from 'path';
import { getPath } from './temp';
import { shell } from 'electron';
import { safe, typetag } from './api';
import { parseConatinerPath } from './utils';

export default class Downloader {
  constructor(networkPath, callback) {
    this.path = networkPath;
    this.callback = callback;
    this.cancelled = false;
  }

  start() {
    const containerPath = parseConatinerPath(this.path);
    const tokens = this.path.split('/');
    const filePath = path.join(getPath(), tokens.pop());

    return safe.auth.canAccessContainer('_public')
      .then((hasAccess) => {
        if (!hasAccess) {
          return Promise.reject(new Error('No access to _public container'));
        }
      })
      .then(() => safe.auth.getAccessContainerInfo('_public'))
      .then((mdata) => mdata.get(containerPath.dir))
      .then((val) => {
        console.log(val);
        return safe.mutableData.newPublic(val.buf, typetag);
      })
      .then((mdata) => {
        const nfs = mdata.emulateAs('NFS');
        return nfs.fetch(containerPath.file)
          .then((file) => {
            return safe.immutableData.fetch(file.dataMapName);
          })
          .then((i) => i.read());
      })
      .then((data) => {
        return new Promise((resolve) => {
          fs.writeFile(filePath, data, () => {
            this.callback(undefined, {
              progress: 100,
              completed: true
            });
            shell.showItemInFolder(filePath);
            resolve();
          });
        });
      })
      .catch((err) => {
        this.callback(err);
      });
  }

  cancel() {
    this.cancelled = true;
  }
}
