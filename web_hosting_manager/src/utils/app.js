import crypto from 'crypto';
import CONSTANTS from '../constants';

// domain check for public name and service name
export const domainCheck = (str) => {
  const regex = /^[a-z0-9][a-z0-9-]{1,60}[a-z0-9](?:)+$/;
  return regex.test(str);
};

// set default prefix for service container name
export const defaultServiceContainerName = serviceName =>
  `${CONSTANTS.UI.DEFAULT_SERVICE_CONTAINER_PREFIX}${serviceName}`;

// convert bytes to size of other variants
export const bytesToSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return `0 ${sizes[0]}`;
  }
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  if (i === 0) {
    return `${bytes} ${sizes[i]}`;
  }
  const resultStr = (bytes / (1024 ** i)).toFixed(1);
  return `${resultStr} ${sizes[i]}`;
};

const trimErrorMsg = (msg) => {
  let index = msg.indexOf('->');
  index = (index === -1) ? 0 : index + 2;
  return msg.slice(index).trim();
};

export const parseErrorMsg = (err) => {
  switch (err.code) {
    case CONSTANTS.ERROR_CODE.NO_SUCH_KEY:
      return CONSTANTS.UI.ERROR_MSG.NO_SUCH_KEY;

    case CONSTANTS.ERROR_CODE.ENTRY_EXISTS:
      return CONSTANTS.UI.ERROR_MSG.ENTRY_EXISTS;

    case CONSTANTS.ERROR_CODE.NO_SUCH_ENTRY:
      return CONSTANTS.UI.ERROR_MSG.NO_SUCH_ENTRY;

    case CONSTANTS.ERROR_CODE.LOW_BALANCE:
      return CONSTANTS.UI.ERROR_MSG.LOW_BALANCE;

    default:
      return trimErrorMsg(err.message);
  }
};

export const decodeURI = uri => decodeURIComponent(uri);

export const genKey = () => crypto.randomBytes(30).toString('hex');
