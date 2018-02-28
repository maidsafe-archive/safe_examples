import { shell } from 'electron';
import { initializeApp, fromAuthURI } from '@maidsafe/safe-node-app';
import { getAuthData, saveAuthData, clearAuthData,
  parseUrl, showError } from '../utils/app_utils';
import pkg from '../../package.json';
import { CONSTANTS } from '../constants';
import 'babel-polyfill';
import log from '../logging';

export const APP_INFO = {
  info: {
    id: pkg.identifier,
    scope: null,
    name: pkg.productName,
    vendor: pkg.vendor
  },
  opts: {
    own_container: true
  },
  containers: {
    publicNames: '_publicNames'
  },
  permissions: {
    _publicNames: ['Read', 'Insert']
  }
};

const DEVELOPMENT = 'dev';
const nodeEnv = process.env.NODE_ENV || DEVELOPMENT

let libPath;

if (nodeEnv === DEVELOPMENT) {
  libPath = CONSTANTS.DEV_LIB_PATH;
} else {
  libPath = CONSTANTS.ASAR_LIB_PATH;
}

/*
* A request to share access to a Mutable Data structure becomes necessary when\
* that structure was created by the same user, however, in a foreign application
*
* This function will cause a shared MD auth popup to appear in SAFE Browser
*/
export const requestShareMdAuth = async (app, mdPermissions) => {
  try {
    const resp = await app.auth.genShareMDataUri(mdPermissions);
    // commented out until system_uri open issue is solved for osx
    // await app.auth.openUri(resp.uri);
    log.info('Request to share MutableData being sent to authenticator...');
    shell.openExternal(parseUrl(resp.uri));
    return;
  } catch (err) {
    log.error(err);
    throw err;
  }
}

const requestAuth = async () => {
  log.info('Generating auth URI...');
  try {
    const app = await initializeApp(APP_INFO.info, null, { libPath });
    const resp = await app.auth.genAuthUri(APP_INFO.permissions, APP_INFO.opts);
    // commented out until system_uri open issue is solved for osx
    // await app.auth.openUri(resp.uri);
    log.info('Authorisation request sent to authenticator');
    shell.openExternal(parseUrl(resp.uri));
    return;
  } catch (err) {
    log.info('app initialisation failed');
    log.error(err);
    showError();
  }
}

/*
* Handles whether or not to request authorisation, to use already generated/
* auth data, or to use fake auth for development purposes.
*/
export const authApp = async (netStatusCallback) => {
  if (process.env.SAFE_FAKE_AUTH) {
    const app = await initializeApp(APP_INFO.info, null, { libPath });
    return app.auth.loginForTest(APP_INFO.permissions);
  }

  const uri = getAuthData();
  if (uri) {
    try {
      const registeredApp = await fromAuthURI(APP_INFO.info, uri, netStatusCallback, { libPath });
      await registeredApp.auth.refreshContainersPermissions();
      return registeredApp;
    } catch (err) {
      log.warn("Auth URI stored is not valid anymore, app needs to be re-authorised.");
      clearAuthData();
      return requestAuth();
    }
  }
  return requestAuth();
}

/*
* Once this app's authorisation has been approved, it will then use the connect/
* function to create a registered session with the network.
*/
export const connect = async (uri, netStatusCallback) => {
  log.info('Connecting to network...');
  console.time('Connect');
  try {
    const registeredApp = await fromAuthURI(APP_INFO.info, uri, netStatusCallback, { libPath });
    console.timeEnd('Connect');
    // synchronous
    saveAuthData(uri);
    await registeredApp.auth.refreshContainersPermissions();
    log.info('Connected to network.');
    return registeredApp;
  } catch (err) {
    log.error(err);
    throw err;
  }
}

export const reconnect = (app) => {
  log.info('Reconnecting to network...');
  return app.reconnect();
}

export const genEncKeyPair = async (app) => {
  log.info('Generating encrypted key pair...');
  try {
    let rawKeyPair = {};
    const keyPair = await app.crypto.generateEncKeyPair();
    const rawPubEncKey = await keyPair.pubEncKey.getRaw();
    rawKeyPair.publicKey = rawPubEncKey.buffer.toString('hex');
    const rawSecEncKey = await keyPair.secEncKey.getRaw();
    rawKeyPair.privateKey = rawSecEncKey.buffer.toString('hex');
    log.info('Encrypted key pair returned');
    return rawKeyPair;
  } catch (err) {
    log.error(err);
    throw err;
  }
}

export const encrypt = async (app, input, pk) => {
  if(Array.isArray(input)) {
    input = input.toString();
  }
  try {
    const stringToBuffer = Buffer.from(pk, 'hex');
    const pubEncKey = await app.crypto.pubEncKeyFromRaw(stringToBuffer);
    return pubEncKey.encryptSealed(input);
  } catch (err) {
    log.error(err);
    throw err;
  }
};

export const decrypt = async (app, cipherMsg, sk, pk) => {
  try {
    const keyPair = await app.crypto.generateEncKeyPairFromRaw(Buffer.from(pk, 'hex'), Buffer.from(sk, 'hex'));
    const decrypted = await keyPair.decryptSealed(cipherMsg);
    return decrypted.toString();
  } catch (err) {
    log.error(err);
    throw err;
  }
};
