
import path from 'path';
import { shell } from 'electron';

import CONSTANTS from '../../constants';

const parseUrl = url => (
  (url.indexOf('safe-auth://') === -1) ? url.replace('safe-auth:', 'safe-auth://') : url
);

export const openExternal = url => (
  shell.openExternal(parseUrl(url))
);

export const nodeEnv = process.env.NODE_ENV || CONSTANTS.DEV_ENV;

export const parseNetworkPath = (nwPath) => {
  const result = {
    dir: undefined,
    file: undefined,
  };
  if (nwPath) {
    const sep = '/';
    if (path.sep === '\\') {
      const regx = new RegExp(/\\/, 'g');
      nwPath = nwPath.replace(regx, sep);
    }
    const splitPath = nwPath.split(sep);
    result.dir = splitPath.slice(0, 3).join(sep);
    result.file = splitPath.slice(3).join(sep) || path.basename(nwPath);
  }
  return result;
};
