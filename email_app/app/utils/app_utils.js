import crypto from 'crypto';
import * as base64 from 'urlsafe-base64';
import { remote } from 'electron';
import { CONSTANTS } from '../constants';

export const getAuthData = () => {
  let authData = window.JSON.parse(
    window.localStorage.getItem(CONSTANTS.LOCAL_AUTH_DATA_KEY)
  );
  return authData;
};

export const setAuthData = (authData) => {
  return window.localStorage.setItem(CONSTANTS.LOCAL_AUTH_DATA_KEY,
    window.JSON.stringify(authData)
  );
};

export const checkAuthorised = (nextState, replace, callback) => {
  let authData = getAuthData();
  if (!authData) {
    replace('/create_account');
  }
  callback();
};

export const hashEmailId = emailId => {
  return crypto.createHash('sha256').update(emailId).digest('base64');
};

export const generateCoreStructreId = () => {
  return base64.encode(crypto.randomBytes(32).toString('base64'));
};

export const showError = (title, errMsg) => {
  remote.dialog.showMessageBox({
    type: 'error',
    buttons: ['Ok'],
    title,
    message: errMsg
  }, _ => {});
};


export const showSuccess = (title, message) => {
  remote.dialog.showMessageBox({
    type: 'info',
    buttons: ['Ok'],
    title,
    message
  }, _ => {});
};
