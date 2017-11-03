import { initializeApp, fromAuthURI } from '@maidsafe/safe-node-app';
import CONSTANTS from '../constants';

const DEVELOPMENT = 'dev';
const nodeEnv = process.env.NODE_ENV || DEVELOPMENT

let libPath;

if (nodeEnv === DEVELOPMENT) {
  libPath = CONSTANTS.DEV_LIB_PATH;
} else {
  libPath = CONSTANTS.ASAR_LIB_PATH;
}

const parseUrl = (uri) => {
  (uri.indexOf('safe-auth://') === -1) ? uri.replace('safe-auth:', 'safe-auth://') : uri
};

const getMDataValueForKey = async (md, key) => {
  try {
    const encKey = await md.encryptKey(key);
    const value = await md.get(encKey);
    const result = await md.decrypt(value.buf);
    return result;
  } catch (err) {
    throw err;
  }
}
export const requestAuth = async () => {
  try {
    const app = await initializeApp(CONSTANTS.APP_INFO.info, null, { libPath });
    const resp = await app.auth.genAuthUri(CONSTANTS.APP_INFO.permissions, CONSTANTS.APP_INFO.opts);
    // commented out until system_uri open issue is solved for osx
    // await app.auth.openUri(resp.uri);
    shell.openExternal(parseUrl(resp.uri));
    return;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/*
* A request to share access to a Mutable Data structure becomes necessary when\
* that structure was created by the same user, however, in a foreign application
*
* This function will cause a shared MD auth popup to appear in SAFE Browser
*/
export const requestSharedMDAuth = async (app, publicName) => {
  const mdPermissions = [];
  if (!publicName) {
    return Promise.reject(new Error('Invalid publicName'));
  }
  try {
    const pubNamesCntr = await app.auth.getContainer(CONSTANTS.ACCESS_CONTAINERS.PUBLIC_NAMES);
    const servCntrName = await getMDataValueForKey(pubNamesCntr, publicName);

    // Add service container to request array
    mdPermissions.push({
      type_tag: CONSTANTS.TYPE_TAG.DNS,
      name: servCntrName,
      perms: ['Insert', 'Update', 'Delete'],
    });

    const servCntr = await app.mutableData.newPublic(servCntrName, CONSTANTS.TYPE_TAG.DNS);
    const services = await servCntr.getEntries();
    await services.forEach((key, val) => {
      const service = key.toString();

      // check service is not an email or deleted
      if ((service.indexOf(CONSTANTS.MD_EMAIL_PREFIX) !== -1)
        || (val.buf.length === 0) || service === CONSTANTS.MD_META_KEY) {
        return;
      }
      mdPermissions.push({
        type_tag: CONSTANTS.TYPE_TAG.WWW,
        name: val.buf,
        perms: ['Insert', 'Update', 'Delete'],
      });
    });

    const resp = await app.auth.genShareMDataUri(mdPermissions);
    // commented out until system_uri open issue is solved for osx
    // await app.auth.openUri(resp.uri);
    shell.openExternal(parseUrl(resp.uri));
    return;
  } catch (err) {
    throw err;
  }
};

export default connect = async (uri, netStatusCallback) => {
  if (!uri) {
    return Promise.reject(new Error('Invalid Auth response'));
  }

  try {
    const app = await fromAuthURI(CONSTANTS.APP_INFO.info, uri, netStatusCallback, { libPath });
    await app.auth.refreshContainersPermissions();
    netStatusCallback(CONSTANTS.NETWORK_STATE.CONNECTED);
    return app;
  } catch (err) {
    throw err;
  }
};

export default connectWithSharedMd = (app, uri) => {
  if (!resUri) {
    return Promise.reject(new Error('Invalid Shared Mutable Data Auth response'));
  }
  try {
    await fromAuthURI(CONSTANTS.APP_INFO.info, uri, { libPath });
    return;
  } catch (err) {
    throw err;
  }
};

/**
 * Reconnect the application with SAFE Network when disconnected
 */
export const reconnect = (app) => {
  if (!app) {
    return Promise.reject(new Error('Application not initialised'));
  }
  return app.reconnect();
};
