import fs from 'fs';

import Task from './task';
import { parseNetworkPath } from './utils';
import CONSTANTS from '../../constants';

export default class FileUploadTask extends Task {
  constructor(api, localPath, networkPath) {
    super();
    this.api = api;
    this.localPath = localPath;
    this.networkPath = networkPath;
    this.cancelled = false;
  }

  execute(callback) {
    const containerPath = parseNetworkPath(this.networkPath);
    const fileStats = fs.statSync(this.localPath);
    let chunkSize = CONSTANTS.UPLOAD_CHUNK_SIZE;
    const fd = fs.openSync(this.localPath, 'r');
    let offset = 0;
    let buffer = null;
    const { size } = fileStats;
    const writeFile = (file, remainingBytes) => (
      new Promise(async (resolve, reject) => {
        try {
          if (this.cancelled) {
            return reject(new Error());
          }

          if (remainingBytes < chunkSize) {
            chunkSize = remainingBytes;
          }
          buffer = Buffer.alloc(chunkSize);
          fs.readSync(fd, buffer, 0, chunkSize, offset);
          await file.write(buffer);
          offset += chunkSize;
          remainingBytes -= chunkSize;
          if (offset === size) {
            callback(null, {
              isFile: true,
              isCompleted: false,
              size: chunkSize,
            });
            await file.close();
            return resolve(file);
          }
          callback(null, {
            isFile: true,
            isCompleted: false,
            size: chunkSize,
          });
          await writeFile(file, remainingBytes);
          resolve();
        } catch (err) {
          reject(err);
        }
      })
    );

    return new Promise(async (resolve) => {
      try {
        const pubCntr = await this.api.getPublicContainer();
        const servFolderName = await this.api.getMDataValueForKey(pubCntr, containerPath.dir);
        const servFolder = await this.api.getServiceFolderMD(servFolderName);
        const nfs = servFolder.emulateAs('NFS');
        const file = await nfs.open();
        await writeFile(file, size);
        try {
          await nfs.insert(containerPath.file, file);
        } catch (e) {
          if (e.code !== CONSTANTS.ERROR_CODE.ENTRY_EXISTS) {
            callback(e);
            return resolve();
          }
          const fileXorname = await servFolder.get(containerPath.file);
          if (fileXorname.buf.length !== 0) {
            callback(e);
            return resolve();
          }
          await nfs.update(containerPath.file, file, fileXorname.version + 1);
        }
        callback(null, {
          isFile: true,
          isCompleted: true,
          size: 0,
        });
        resolve();
      } catch (err) {
        callback(err);
      }
    });
  }
}
