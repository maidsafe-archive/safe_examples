import crypto from 'crypto';
import { remote } from 'electron';
import { CONSTANTS } from '../constants';

export const getAuthData = () => {
  // let authData = window.JSON.parse(
  //   window.localStorage.getItem(CONSTANTS.LOCAL_AUTH_DATA_KEY)
  // );
  // return authData;
};

export const saveAuthData = () => {
  //  window.localStorage.setItem(CONSTANTS.LOCAL_AUTH_DATA_KEY,
  //   window.JSON.stringify(authData)
  // );
};

export const clearAuthData = () => {
  // window.localStorage.removeItem(CONSTANTS.LOCAL_AUTH_DATA_KEY);
};

export const splitPublicIdAndService = (emailId) => {
  // It supports complex email IDs, e.g. 'emailA.myshop', 'emailB.myshop'
  const str = emailId.replace(/\.+$/, '');
  const toParts = str.split('.');
  const publicId = toParts.pop();
  const serviceId = str.slice(0, -1 * (publicId.length + 1));
  emailId = (serviceId.length > 0 ? (`${serviceId}.`) : '') + publicId;
  const serviceName = serviceId + CONSTANTS.SERVICE_NAME_POSTFIX;
  return { emailId, publicId, serviceName };
};

export const genRandomEntryKey = () => crypto.randomBytes(32).toString('hex');

export const showError = (title, errMsg, next) => {
  remote.dialog.showMessageBox({
    type: 'error',
    buttons: ['Ok'],
    title,
    message: errMsg.toString()
  }, next ? next : _ => {});
};

export const showSuccess = (title, message) => {
  remote.dialog.showMessageBox({
    type: 'info',
    buttons: ['Ok'],
    title,
    message
  }, _ => {});
};

export const parseUrl = (url) => (
  (url.indexOf('safe-auth://') === -1) ? url.replace('safe-auth:', 'safe-auth://') : url
  );

export const deserialiseArray = (strOrBuffer) => {
  const arrItems = strOrBuffer.split(',');
  return Uint8Array.from(arrItems);
};
