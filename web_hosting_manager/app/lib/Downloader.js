import fs from 'fs';
import path from 'path';
import { getPath } from './temp';
import { shell } from 'electron';
import { safe, typetag, accessContainers } from './api';

export default class Downloader {
  constructor(networkPath, callback) {
    this.path = networkPath;
    this.callback = callback;
    this.cancelled = false;
  }

  start() {
    const containerPath = {
      dir: this.path.split('/').slice(0, 3).join('/'),
      file: this.path.split('/').slice(3).join('/')
    };
    const tokens = this.path.split('/');
    const filePath = path.join(getPath(), tokens.pop());

    return safe.auth.getAccessContainerInfo(accessContainers.public)
      .then((mdata) => mdata.get(containerPath.dir))
      .then((val) => safe.mutableData.newPublic(val.buf, typetag))
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
