import crypto from 'crypto';
import * as base64 from 'urlsafe-base64';
import { remote } from 'electron';
import { CONSTANTS } from '../constants';

export const getAuthData = () => {
  // let authData = window.JSON.parse(
  //   window.localStorage.getItem(CONSTANTS.LOCAL_AUTH_DATA_KEY)
  // );
  // return authData;
  return;
};

export const saveAuthData = (authData) => {
  return;
  //  window.localStorage.setItem(CONSTANTS.LOCAL_AUTH_DATA_KEY,
  //   window.JSON.stringify(authData)
  // );
};

export const clearAuthData = () => {
  // window.localStorage.removeItem(CONSTANTS.LOCAL_AUTH_DATA_KEY);
};

export const splitPublicIdAndService = (emailId) => {
  // It supports complex email IDs, e.g. 'emailA.myshop', 'emailB.myshop'
  let str = emailId.replace(/\.+$/, '');
  let toParts = str.split('.');
  const publicId = toParts.pop();
  const serviceId =  str.slice(0, -1 * (publicId.length+1));
  emailId = (serviceId.length > 0 ? (serviceId + '.') : '') + publicId;
  const serviceName = serviceId + CONSTANTS.SERVICE_NAME_POSTFIX;
  return {emailId, publicId, serviceName};
}

export const genRandomEntryKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

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

export const deserialiseArray = (str) => {
  let arrItems = str.split(',');
  return Uint8Array.from(arrItems);
}

export const genKeyPair = (app) => {
  let rawKeyPair = {};
  return app.crypto.generateEncKeyPair()
  .then(keyPair => keyPair.pubEncKey.getRaw()
    .then(rawPubEncKey => {
      rawKeyPair.publicKey = rawPubEncKey.buffer;
      return;
    })
    .then(() => keyPair.secEncKey.getRaw())
    .then(rawSecEncKey => {
      rawKeyPair.privateKey = rawSecEncKey.buffer;
      return rawKeyPair;
    })
  )
}

export const encrypt = (app, input) => {
  return app.crypto.getAppPubEncKey()
  .then(pubEncKeyAPI => pubEncKeyAPI.encryptSealed(input))
};

export const decrypt = (app, cipherMsg, sk, pk) => {
  return app.crypto.generateEncKeyPairFromRaw(pk, sk)
  .then(keyPair => {
    return keyPair.decryptSealed(cipherMsg).catch(e => {
      console.log('ERRIR"');
      console.log(e);
    })
  })
};
