import { initializeApp, fromAuthURI } from '@maidsafe/safe-node-app';

import makeError from './error';
import CONSTANTS from '../constants';
import { CONSTANTS as SAFE_CONSTANTS } from '@maidsafe/safe-node-app';
import { openExternal, nodeEnv } from './helpers';

const _app = Symbol('app');
const _appInfo = Symbol('appInfo');
const _libPath = Symbol('libPath');
const isDevMode = process.execPath.match(/[\\/]electron/);

export default class Network {
  constructor() {
    this[_app] = null;
    this[_appInfo] = CONSTANTS.APP_INFO;
    this[_libPath] = CONSTANTS.ASAR_LIB_PATH;
    if ((nodeEnv === CONSTANTS.ENV.DEV) || (nodeEnv === CONSTANTS.ENV.TEST)) {
      this[_libPath] = CONSTANTS.DEV_LIB_PATH;
    }
  }

  get app() {
    return this[_app];
  }

  /**
   * Send Authorisation request to Authenticator.
   * - Initialise the application object
   * - Generate Auth request URI
   * - Send URI to Authenticator
   */
  async requestAuth() {
    // OSX: Add bundle for electron in dev mode
    if (isDevMode && process.platform === 'darwin') {
      this[_appInfo].info.bundle = 'com.github.electron';
    } else if (process.platform === 'darwin') {
      this[_appInfo].info.bundle = 'com.electron.peruse';
    }
    try {
      const app = await initializeApp(this[_appInfo].info, null, { libPath: this[_libPath] });
      const resp = await app.auth.genAuthUri(this[_appInfo].permissions, this[_appInfo].opts);
      // commented out until system_uri open issue is solved for osx
      // await app.auth.openUri(resp.uri);
      openExternal(resp.uri);
      return;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Send Shared Mutable Data authorisation request to Authenticator
   * @param {Array} mdPermissions array of Mutable Data with permissions
   */
  async requestShareMdAuth(mdPermissions) {
    try {
      const resp = await this.app.auth.genShareMDataUri(mdPermissions);
      // commented out until system_uri open issue is solved for osx
      // await this[_app].auth.openUri(resp.uri);
      openExternal(resp.uri);
      return;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Connect with SAFE network after receiving response from Authenticator.
   * This handles auth response, container response, revoked response and deny response.
   * @param {string} uri safe response URI
   * @param {*} netStatusCallback callback function to handle network state change
   */
  async connect(uri, netStatusCallback) {
    if (!uri) {
      return Promise.reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_AUTH_RESP,
        'Invalid Auth response'));
    }

    // Handle Mock response
    if (uri === CONSTANTS.MOCK_RES_URI) {
      return Promise.resolve(true);
    }

    try {
      this[_app] = await fromAuthURI(this[_appInfo].info, uri, netStatusCallback,
        { libPath: this[_libPath] });
      await this.app.auth.refreshContainersPermissions();
      netStatusCallback(CONSTANTS.NETWORK_STATE.CONNECTED);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Decode Shared Mutable Data response received from Authenticator
   * @param {string} resUri the safe response URI of Shared Mutable Data
   */
  async decodeSharedMD(resUri) {
    if (!resUri) {
      return Promise.reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_SHARED_MD_RESP,
        'Invalid Shared Mutable Data Auth response'));
    }
    try {
      await this.app.auth.loginFromURI(resUri);
      return;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Reconnect the application with SAFE Network when disconnected
   */
  reconnect() {
    if (!this.app) {
      return Promise.reject(makeError(CONSTANTS.APP_ERR_CODE.APP_NOT_INITIALISED,
        'Application not initialised'));
    }
    return this.app.reconnect();
  }

  /**
   * Authorise service containers and all the web services under the given public name
   * @param {string} publicName the public name
   */
  async authoriseSharedMD(publicName) {
    const mdPermissions = [];
    if (!publicName) {
      return Promise.reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_PUBLIC_NAME,
        'Invalid publicName'));
    }
    try {
      const pubNamesCntr = await this.getPublicNamesContainer();
      const servCntrName = await this.getMDataValueForKey(pubNamesCntr, publicName);

      // Add service container to request array
      mdPermissions.push({
        type_tag: CONSTANTS.TYPE_TAG.DNS,
        name: servCntrName,
        perms: ['Insert', 'Update', 'Delete'],
      });

      const servCntr = await this.getServicesContainer(servCntrName);
      const services = await servCntr.getEntries();
      await services.forEach((key, val) => {
        const service = key.toString();
        // Let's filter out the services which are not web services,
        // i.e. those which don't have a `@<service type>` postfix.
        // Also filter out the MD metadata entry and soft-deleted values.
        if ((service.indexOf(CONSTANTS.SERVICE_TYPE_POSTFIX_DELIM) !== -1)
          || (val.buf.length === 0) || service === SAFE_CONSTANTS.MD_METADATA_KEY) {
          return;
        }
        mdPermissions.push({
          type_tag: CONSTANTS.TYPE_TAG.WWW,
          name: val.buf,
          perms: ['Insert', 'Update', 'Delete'],
        });
      });
      await this.requestShareMdAuth(mdPermissions);
      return;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Authorise application for dev environment
   * This creates a test login for development purpose
   */
  async authoriseMock() {
    try {
      this[_app] = await initializeApp(this[_appInfo].info, null, { libPath: this[_libPath] });
      await this.app.auth.loginForTest(this[_appInfo].permissions);
      return;
    } catch (err) {
      throw err;
    }
  }
}
