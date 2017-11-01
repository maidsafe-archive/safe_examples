import path from 'path';
import fs from 'fs';

import CONSTANTS from '../../constants';

export default class DirStats {
  constructor() {
    this.size = 0;
    this.files = 0;
    this.directories = 0;
  }
}

export const getDirectoryStats = (localPath) => {
  let tempStat;
  let tempDirStat;
  let tempPath;
  const resultStats = new DirStats();
  const contents = fs.readdirSync(localPath);
  resultStats.directories += 1;
  for (const content of contents) {
    if (!content) {
      break;
    }
    tempPath = `${localPath}/${content}`;
    tempStat = fs.statSync(tempPath);
    if (tempStat.isDirectory()) {
      tempDirStat = getDirectoryStats(tempPath);
      resultStats.size += tempDirStat.size;
      resultStats.files += tempDirStat.files;
      resultStats.directories += tempDirStat.directories;
    } else {
      if (tempStat.size > CONSTANTS.MAX_FILE_SIZE) {
        throw new Error(`Restricted file size. Max ${(CONSTANTS.MAX_FILE_SIZE / 1000000)} allowed`);
      }
      resultStats.files += 1;
      resultStats.size += tempStat.size;
    }
  }
  return resultStats;
};

export const readDir = (destPath) => {
  let files = [];
  const items = fs.readdirSync(destPath);
  for(const item of items) {
    const fullPath = path.resolve(destPath, item);
    const isDir = fs.statSync(fullPath).isDirectory();
    if (isDir) {
      const nextFiles = readDir(fullPath);
      files = files.concat(nextFiles);
    } else {
      files.push(fullPath);
    }
  }
  return files;
};
