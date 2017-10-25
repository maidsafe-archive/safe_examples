/**
 * SafeApi - This is the API layer for Web Hosting Manager.
 * This provides apis for handle PublicNames, Services and
 * File management
 */

/* eslint-disable no-underscore-dangle */
import { shell } from 'electron';
import safeApp from '@maidsafe/safe-node-app';
import { I18n } from 'react-redux-i18n';

import Uploader from './Uploader';
import Downloader from './Downloader';
import makeError from './_error';
import CONSTANTS from '../constants';
import { openExternal, nodeEnv } from './utils';

// Private variables
const _app = Symbol('app');
const _publicNames = Symbol('publicNames');
const _appInfo = Symbol('appInfo');
const _uploader = Symbol('uploader');
const _downloader = Symbol('downloader');
const _libPath = Symbol('libPath');

class SafeApi {
  constructor() {
    this[_app] = null;
    this[_publicNames] = [];
    this[_appInfo] = CONSTANTS.APP_INFO;
    this[_uploader] = null;
    this[_downloader] = null;
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
  sendAuthReq() {
    return new Promise(async (resolve, reject) => {
      try {
        const app = await safeApp.initializeApp(
          this[_appInfo].data,
          null,
          { libPath: this[_libPath] },
        );
        const resp = await app.auth.genAuthUri(this[_appInfo].permissions, this[_appInfo].opt);
        openExternal(resp.uri);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Send Shared Mutable Data authorisation request to Authenticator
   * @param {Array} mdList array of Mutable Data with permissions
   */
  sendMDReq(mdList) {
    return new Promise(async (resolve, reject) => {
      try {
        const resp = await this[_app].auth.genShareMDataUri(mdList);
        openExternal(resp.uri);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Authorise application for dev environment
   * This creates a test login for development purpose
   */
  authoriseMock() {
    return new Promise(async (resolve, reject) => {
      try {
        this[_app] = await safeApp.initializeApp(
          this[_appInfo].data,
          null,
          { libPath: this[_libPath] },
        );
        await this[_app].auth.loginForTest(this[_appInfo].permissions);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Authorise service containers and all the web services under the given public name
   * @param {string} publicName the public name
   */
  authoriseMD(publicName) {
    const reqArr = [];
    return new Promise(async (resolve, reject) => {
      if (!publicName) {
        return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_PUBLIC_NAME, 'Invalid publicName'));
      }

      try {
        const pubNamesCntr = await this.getPublicNamesContainer();
        const servCntrName = await this.getMDataValueForKey(pubNamesCntr, publicName);

        // Add service container to request array
        reqArr.push({
          type_tag: CONSTANTS.TYPE_TAG.DNS,
          name: servCntrName,
          perms: ['Insert', 'Update', 'Delete'],
        });

        const servCntr = await this.getPublicNameMD(servCntrName);
        const services = await servCntr.getEntries();
        await services.forEach((key, val) => {
          const service = key.toString();

          // check service is not an email or deleted
          if ((service.indexOf(CONSTANTS.MD_EMAIL_PREFIX) !== -1)
            || (val.buf.length === 0) || service === CONSTANTS.MD_META_KEY) {
            return;
          }
          reqArr.push({
            type_tag: CONSTANTS.TYPE_TAG.WWW,
            name: val.buf,
            perms: ['Insert', 'Update', 'Delete'],
          });
        });
        await this.sendMDReq(reqArr);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Connect with SAFE network after receiving response from Authenticator.
   * This handles auth response, container response, revoked response and deny response.
   * @param {string} uri safe response URI
   * @param {*} nwStateChangeCb callback function to handle network state change
   */
  connect(uri, nwStateChangeCb) {
    return new Promise(async (resolve, reject) => {
      if (!uri) {
        return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_AUTH_RESP, 'Invalid Auth response'));
      }

      // Handle Mock response
      if (uri === CONSTANTS.MOCK_RES_URI) {
        return resolve(true);
      }

      try {
        const app = await safeApp.fromAuthURI(
          this[_appInfo].data,
          uri,
          nwStateChangeCb,
          { libPath: this[_libPath] },
        );

        // Send network connected state
        nwStateChangeCb(CONSTANTS.NETWORK_STATE.CONNECTED);

        this[_app] = app;
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Decode Shared Mutable Data response received from Authenticator
   * @param {string} resUri the safe response URI of Shared Mutable Data
   */
  decodeSharedMD(resUri) {
    return new Promise(async (resolve, reject) => {
      if (!resUri) {
        return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_SHARED_MD_RESP,
          'Invalid Shared Mutable Data Auth response'));
      }
      try {
        await safeApp.fromAuthURI(
          this[_appInfo].data,
          resUri,
          { libPath: this[_libPath] },
        );
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Reconnect the application with SAFE Network when disconnected
   */
  reconnect() {
    if (!this[_app]) {
      return Promise.reject(makeError(CONSTANTS.APP_ERR_CODE.APP_NOT_INITIALISED,
        'Application not initialised'));
    }
    return this[_app].reconnect();
  }

  /**
   * Open application log file generated by SAFE-app library
   */
  openLogFile() {
    if (!this[_app]) {
      return Promise.reject(makeError(CONSTANTS.APP_ERR_CODE.APP_NOT_INITIALISED,
        'Application not initialised'));
    }
    this[_app].logPath().then(shell.openItem);
  }

  /**
   * Check application has access to containers requested.
   */
  canAccessContainers() {
    return new Promise(async (resolve, reject) => {
      if (!this[_app]) {
        return Promise.reject(makeError(CONSTANTS.APP_ERR_CODE.APP_NOT_INITIALISED,
          'Application not initialised'));
      }
      try {
        await this[_app].auth.refreshContainersPermissions();
        const accessContainers = Object.keys(CONSTANTS.ACCESS_CONTAINERS);
        await Promise.all(accessContainers.map(cont =>
          this[_app].auth.canAccessContainer(CONSTANTS.ACCESS_CONTAINERS[cont])));
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Create new Public Name
   * - Create new Public Mutable Data with sha3hash of publicName as its XORName
   * - Create new entry with publicName as key and XORName as its value
   * - Insert this entry within the _publicNames container
   * @param {string} publicName the public name
   */
  createPublicName(publicName) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!publicName) {
          return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_PUBLIC_NAME, 'Invalid publicName'));
        }
        const name = publicName.trim();
        const metaName = `Services container for: ${name}`;
        const metaDesc = `Container where all the services are mapped for the Public Name: ${name}`;
        const hashedName = await this[_app].crypto.sha3Hash(name);

        const servCntr = await this.getPublicNameMD(hashedName);
        await servCntr.quickSetup({}, metaName, metaDesc);
        const pubNamesCntr = await this.getPublicNamesContainer();
        await this._insertToMData(pubNamesCntr, name, hashedName, true);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Fetch Public Names under _publicNames container
   * @return {Promise<[PublicNames]>} array of Public Names
   */
  fetchPublicNames() {
    const publicNames = [];

    const decryptPublicName = (pubNamesCntr, encPubName) => (
      new Promise(async (resolve, reject) => {
        try {
          const decPubNameBuf = await pubNamesCntr.decrypt(encPubName);
          const decPubName = decPubNameBuf.toString();
          if (decPubName !== CONSTANTS.MD_META_KEY) {
            publicNames.push({
              name: decPubName
            });
          }
          resolve(true);
        } catch(err) {
          if (err.code === CONSTANTS.ERROR_CODE.SYMMETRIC_DECIPHER_FAILURE) {
            return resolve(true);
          }
          reject(err);
        }
      })
    );

    return new Promise(async (resolve, reject) => {
      try {
        const pubNamesCntr = await this.getPublicNamesContainer();
        const pubNames = await pubNamesCntr.getKeys();
        const pubNamesLen = await pubNames.len();
        if (pubNamesLen === 0) {
          return resolve([]);
        }
        const encPubNames = [];
        await pubNames.forEach((key) => {
          encPubNames.push(key);
        });

        const decryptPubNamesQ = [];
        for (const encPubName of encPubNames) {
          decryptPubNamesQ.push(decryptPublicName(pubNamesCntr, encPubName));
        }

        await Promise.all(decryptPubNamesQ);
        this[_publicNames] = publicNames.slice(0);
        resolve(this[_publicNames]);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Create service folder within _public container
   * - Create random public mutable data and insert it under _public container
   * - This entry will have the servicePath as its key
   * - This Mutable Data will hold the list file stored under it and
   * the files full paths will be stored as the key to maintain a plain structure.
   * @param {string} servicePath - service path on network
   * @param {string} metaFor - will be of `serviceName.publicName` format
   */
  createServiceFolder(servicePath, metaFor) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!servicePath) {
          return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_PATH, 'Invalid service path'));
        }
        if (!metaFor) {
          return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_META, 'Invalid service metadata'));
        }
        const metaName = `Service Root Directory for: ${metaFor}`;
        const metaDesc = `Has the files hosted for the service: ${metaFor}`;

        const servFolder = await this[_app].mutableData.newRandomPublic(CONSTANTS.TYPE_TAG.WWW);
        await servFolder.quickSetup({}, metaName, metaDesc);
        const servFolderInfo = await servFolder.getNameAndTag();
        const pubCntr = await this.getPublicContainer();
        await this._insertToMData(pubCntr, servicePath, servFolderInfo.name);
        resolve(servFolderInfo.name);
      } catch(err) {
        reject(err);
      }
    });
  }

  /**
   * Create new service
   * - Insert an entry into the service container with
   * key as sericeName and value as pathXORName
   * - If serviceName was created and deleted before,
   * it leaves the entry with empty buffer as its value.
   * Update the entry with the pathXORName as its value.
   * @param {string} publicName the public name
   * @param {string} serviceName the service name
   * @param {Buffer} pathXORName XORName of service Mutable Data
   */
  createService(publicName, serviceName, pathXORName) {
    return new Promise(async (resolve, reject) => {
      if (!publicName) {
        return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_PUBLIC_NAME, 'Invalid publicName'));
      }
      if (!serviceName) {
        return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_NAME, 'Invalid serviceName'));
      }
      if (!pathXORName) {
        return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_PATH, 'Invalid service path'));
      }
      let servCntr;
      try {
        const pubNamesCntr = await this.getPublicNamesContainer();
        const servCntrName = await this.getMDataValueForKey(pubNamesCntr, publicName);
        servCntr = await this.getPublicNameMD(servCntrName);
        await this._insertToMData(servCntr, serviceName, pathXORName);
        resolve(true);
      } catch (err) {
        if (err.code !== CONSTANTS.ERROR_CODE.ENTRY_EXISTS) {
          return reject(err);
        }
        try {
          await this._updateMDataKey(servCntr, serviceName, pathXORName, true);
        } catch (e) {
          return reject(e);
        }
        resolve(true);
      }
    });
  }

  /**
   * Fetch services registered unders all the Public Names
   * @return {Promise<[PublicNames]>} array of Public Names with services
   */
  fetchServices() {
    const self = this;
    const publicNames = this[_publicNames].slice(0);
    const updatedPubNames = [];

    const updateServicePath = (service) => {
      return new Promise(async (resolve, reject) => {
        try {
          const path = await this._getServicePath(service.xorname);
          resolve({
            name: service.name,
            path
          });
        } catch(err) {
          reject(err);
        }
      });
    };

    const fetch = (pubName) => {
      const serviceList = [];
      return new Promise(async (resolve, reject) => {
        try {
          const pubNamesCntr = await this.getPublicNamesContainer();
          const servCntrName = await this.getMDataValueForKey(pubNamesCntr, pubName);
          const servCntr = await this.getPublicNameMD(servCntrName);
          const services = await servCntr.getEntries();
          await services.forEach((key, value) => {
            const service = key.toString();
            // check service is not an email or deleted
            if ((service.indexOf('@email') !== -1) || (value.buf.length === 0) || service === CONSTANTS.MD_META_KEY) {
              return;
            }
            serviceList.push({
              name: service,
              xorname: value.buf
            });
          });
          const servicesQ = [];
          for(const service of serviceList) {
            servicesQ.push(updateServicePath(service));
          }

          const updatedServList = await Promise.all(servicesQ);

          updatedPubNames.push({
            name: pubName,
            services: updatedServList
          });
          resolve();
        } catch(err) {
          reject(err);
        }
      });
    };

    return new Promise(async (resolve, reject) => {
      try {
        const publicNameQ = [];
        for(const pubName of publicNames) {
          publicNameQ.push(fetch(pubName.name));
        }
        await Promise.all(publicNameQ);
        this[_publicNames] = updatedPubNames.slice(0);
        resolve(this[_publicNames]);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Delete a service
   * - Deletes the entry of serviceName under service container of publicName
   * - This will make the value of that entry to empty buffer
   * @param {string} publicName the public name
   * @param {string} serviceName the service name to delete
   */
  deleteService(publicName, serviceName) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!publicName) {
          return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_PUBLIC_NAME, 'Invalid publicName'));
        }
        if (!serviceName) {
          return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_NAME, 'Invalid serviceName'));
        }
        const hashedPubName = await this[_app].crypto.sha3Hash(publicName);
        const servCntr = await this.getPublicNameMD(hashedPubName);
        await this._removeFromMData(servCntr, serviceName);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Remap the service to different service Mutable Data
   * - Update the service entry with XORName of Mutable Data under given servicePath
   * @param {string} publicName the public name
   * @param {string} serviceName the service name
   * @param {string} servicePath service path to which the service to be remapped
   */
  remapService(publicName, serviceName, servicePath) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!publicName) {
          return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_PUBLIC_NAME, 'Invalid publicName'));
        }
        if (!serviceName) {
          return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_NAME, 'Invalid serviceName'));
        }
        if (!servicePath) {
          return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_PATH, 'Invalid service path'));
        }
        const pubCntr = await this.getPublicContainer();
        const servFolderPath = await this.getMDataValueForKey(pubCntr, servicePath);
        const pubNamesCntr = await this.getPublicNamesContainer();
        const servCntrName = await this.getMDataValueForKey(pubNamesCntr, publicName);
        const servCntr = await this.getPublicNameMD(servCntrName);
        await this._updateMDataKey(servCntr, serviceName, servFolderPath);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Check service container is accessible by this application
   * @param {string} publicName the public name
   */
  canAccessServiceContainer(publicName) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!publicName) {
          return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_PUBLIC_NAME, 'Invalid publicName'));
        }
        const pubNameCntr = await this.getPublicNamesContainer();
        const servCntrName = await this.getMDataValueForKey(pubNameCntr, publicName);
        const servCntr = await this.getPublicNameMD(servCntrName);
        await this._checkMDAccessible(servCntr);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Get list name of service folder stored under _public container
   * - will get list of service paths under the container
   */
  getServiceFolderNames() {
    const serviceFolderList = [];
    return new Promise(async (resolve, reject) => {
      try {
        const pubCntr = await this.getPublicContainer();
        const serviceFolders = await pubCntr.getKeys();
        const serviceFoldersLen = await serviceFolders.len();
        if (serviceFoldersLen !== 0) {
          await serviceFolders.forEach((key) => {
            if (!key) {
              return;
            }
            serviceFolderList.unshift(key.toString());
          });
        }
        resolve(serviceFolderList);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Get serive Mutable Data name and typeTag
   * @param {string} servicePath path to service mutable data
   */
  getServiceFolderInfo(servicePath) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!servicePath) {
          return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_PATH, 'Invalid service path'));
        }
        const pubCntr = await this.getPublicContainer();
        const servFolderName = await this.getMDataValueForKey(pubCntr, servicePath);
        const servFolder = await this.getServiceFolderMD(servFolderName);
        const servFolderInfo = await servFolder.getNameAndTag();
        resolve(servFolderInfo);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Delete a file or director
   * - this API uses NFS delete api to delete a file
   * - If it is a directory, collects all the file under that directory and
   * delete them in sequence.
   */
  deleteFileOrDir(netPath) {
    const containerName = netPath.split('/').slice(0, 3).join('/');
    let containerKey = netPath.slice(containerName.length);
    if (containerKey[0] === '/') {
      containerKey = containerKey.slice(1);
    }

    const deleteFiles = (nfs, files) => (
      new Promise(async (resolve, reject) => {
        try {
          if (files.length === 0) {
            return resolve(true);
          }
          const file = files[0];
          const f = await nfs.fetch(file.path);
          await nfs.delete(file.path, f.version + 1);
          files.shift();
          await deleteFiles(nfs, files);
          resolve(true);
        } catch (err) {
          reject(err);
        }
      })
    );

    return new Promise(async (resolve, reject) => {
      try {
        const pubCntr = await this.getPublicContainer();
        const servFolderName = await this.getMDataValueForKey(pubCntr, containerName);
        const servFolder = await this.getServiceFolderMD(servFolderName);
        const files = [];
        const filesPath = await servFolder.getEntries();
        await filesPath.forEach((key, val) => {
          const keyStr = key.toString();
          if ((keyStr.indexOf(containerKey) !== 0) || keyStr === CONSTANTS.MD_META_KEY) {
            return;
          }
          if (val.buf.length === 0) {
            return;
          }
          files.push({ path: keyStr, version: val.version });
        });
        const nfs = servFolder.emulateAs('NFS');
        await deleteFiles(nfs, files);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Get list of files stored under the service Mutable Data
   * - get the file paths and transform it into directory structure
   * @param {string} servicePath path to service mutable data
   */
  fetchFiles(servicePath) {
    const fetchFile = (nfs, file) => {
      return new Promise(async(resolve, reject) => {
        try {
          let fileObj = await nfs.fetch(file);
          fileObj = await nfs.open(fileObj, CONSTANTS.FILE_OPEN_MODE.OPEN_MODE_READ);
          const fileSize = await fileObj.size();
          const dirName = servicePath.split('/').slice(3).join('/');
          resolve({
            isFile: true,
            name: dirName ? file.substr(dirName.length + 1) : file,
            size: fileSize,
          });
        } catch(err) {
          reject(err);
        }
      });
    };
    return new Promise(async (resolve, reject) => {
      try {
        const pubCntr = await this.getPublicContainer();
        const servFolderName = await this.getMDataValueForKey(pubCntr, servicePath.split('/').slice(0, 3).join('/'));
        const servFolder = await this.getServiceFolderMD(servFolderName);

        const files = [];
        let result = [];
        const rootPath = servicePath.split('/').slice(3).join('/');

        await this._checkMDAccessible(servFolder);

        const filePaths = await servFolder.getEntries();
        await filePaths.forEach((key, val) => {
          if (val.buf.length === 0) {
            return;
          }
          const keyStr = key.toString();
          if ((rootPath && (keyStr.indexOf(rootPath) !== 0))
            || keyStr === CONSTANTS.MD_META_KEY) {
            return;
          }
          let keyStrTrimmed = keyStr;
          if (rootPath.length > 0) {
            keyStrTrimmed = keyStr.substr(rootPath.length + 1);
          }
          if (keyStrTrimmed.split('/').length > 1) {
            const dirName = keyStrTrimmed.split('/')[0];
            if (result.filter(file => (file.name === dirName)).length === 0) {
              return result.unshift({ isFile: false, name: dirName });
            }
            return;
          }
          files.unshift(keyStr);
        });

        const nfs = servFolder.emulateAs('NFS');

        const fetchFileQ = [];
        for(const file of files) {
          fetchFileQ.push(fetchFile(nfs, file));
        }

        const resultFiles = await Promise.all(fetchFileQ);
        result = result.concat(resultFiles);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Update service if it is a deleted one
   * @param {string} publicName the public name
   * @param {string} serviceName the serive name
   * @param {string} servicePath path to service mutable data
   */
  updateServiceIfExist(publicName, serviceName, servicePath) {
    return new Promise(async (resolve, reject) => {
      try {
        const publicNamesMd = await this.getPublicNamesContainer();
        const val = await this.getMDataValueForKey(publicNamesMd, publicName);
        const md = await this[_app].mutableData.newPublic(val, CONSTANTS.TYPE_TAG.DNS);
        const value = await md.get(serviceName);
        if (value.buf.length !== 0) {
          return resolve(true);
        }
        const publicMd = await this.getPublicContainer();
        const publicMdVal = await this.getMDataValueForKey(publicMd, servicePath);
        await this._updateMDataKey(md, serviceName, publicMdVal);
        resolve(true);
      } catch (err) {
        if (err.code === CONSTANTS.ERROR_CODE.NO_SUCH_ENTRY) {
          return resolve(false);
        }
        reject(err);
      }
    });
  }

  /**
   * Upload a file or directory
   * @param {string} localPath file path on machine
   * @param {string} networkPath file path on network
   * @param {function} progressCb the progress callback function
   * @param {function} errorCb the error callback function
   */
  fileUpload(localPath, networkPath, progressCb, errorCb) {
    this[_uploader] = new Uploader(this, localPath, networkPath, progressCb, errorCb);
    this[_uploader].start();
  }

  /**
   * Cancel file upload process
   */
  cancelFileUpload() {
    this[_uploader].cancel();
  }

  /**
   * Download a file
   * @param {string} networkPath - file path on network
   * @param {function} callback the progress callback function
   */
  fileDownload(networkPath, callback) {
    this[_downloader] = new Downloader(this, networkPath, callback);
    this[_downloader].start();
  }

  /**
   * Cancel file download process
   */
  cancelFileDownload() {
    this[_downloader].cancel();
  }

  /**
   * Get _public container mutable data
   */
  getPublicContainer() {
    if (!this[_app]) {
      return Promise.reject(new Error('Application is not connected.'));
    }
    return this[_app].auth.getContainer(CONSTANTS.ACCESS_CONTAINERS.PUBLIC);
  }

  /**
   * Get _publicNames container mutable data
   */
  getPublicNamesContainer() {
    if (!this[_app]) {
      return Promise.reject(new Error('Application is not connected.'));
    }
    return this[_app].auth.getContainer(CONSTANTS.ACCESS_CONTAINERS.PUBLIC_NAMES);
  }

  getPublicNameMD(pubXORName) {
    return this[_app].mutableData.newPublic(pubXORName, CONSTANTS.TYPE_TAG.DNS);
  }

  /* eslint-disable class-methods-use-this */
  getMDataValueForKey(md, key) {
    /* eslint-enable class-methods-use-this */
    return new Promise(async (resolve, reject) => {
      try {
        const encKey = await md.encryptKey(key);
        const value = await md.get(encKey);
        const result = await md.decrypt(value.buf);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  getServiceFolderMD(xorname) {
    return this[_app].mutableData.newPublic(xorname, CONSTANTS.TYPE_TAG.WWW);
  }

  _checkMDAccessible(md) {
    return new Promise(async (resolve, reject) => {
      try {
        const perm = await md.getPermissions();
        const signKey = await this[_app].crypto.getAppPubSignKey();
        const result = await perm.getPermissionSet(signKey);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  /* eslint-disable class-methods-use-this */
  _updateMDataKey(md, key, value, ifEmpty) {
    /* eslint-enable class-methods-use-this */
    return new Promise(async (resolve, reject) => {
      try {
        const entries = await md.getEntries();
        const val = await entries.get(key);
        if (ifEmpty && val.buf.length !== 0) {
          return reject(makeError(CONSTANTS.APP_ERR_CODE.ENTRY_VALUE_NOT_EMPTY, 'Entry value is not empty'));
        }
        const mut = await entries.mutate();
        await mut.update(key, value, val.version + 1);
        await md.applyEntriesMutation(mut);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /* eslint-disable class-methods-use-this */
  _removeFromMData(md, key) {
    /* eslint-enable class-methods-use-this */
    return new Promise(async (resolve, reject) => {
      try {
        const entries = await md.getEntries();
        const value = await entries.get(key);
        const mut = await entries.mutate();
        await mut.remove(key, value.version + 1);
        await md.applyEntriesMutation(mut);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /* eslint-disable class-methods-use-this */
  _insertToMData(md, key, val, toEncrypt) {
    /* eslint-enable class-methods-use-this */
    let keyToInsert = key;
    let valToInsert = val;

    return new Promise(async (resolve, reject) => {
      try {
        const entries = await md.getEntries();
        const mut = await entries.mutate();
        if (toEncrypt) {
          keyToInsert = await md.encryptKey(key);
          valToInsert = await md.encryptValue(val);
        }
        await mut.insert(keyToInsert, valToInsert);
        await md.applyEntriesMutation(mut);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  _getServicePath(serviceXorName) {
    let servicePath = null;
    return new Promise(async (resolve, reject) => {
      try {
        const publicMd = await this.getPublicContainer();
        const entries = await publicMd.getEntries();
        await entries.forEach((key, val) => {
          if (val.buf.equals(serviceXorName)) {
            servicePath = key.toString();
          }
        });
        resolve(servicePath);
      } catch (err) {
        reject(err);
      }
    });
  }
}

const safeApi = new SafeApi();
export default safeApi;
export const Api = (nodeEnv === CONSTANTS.ENV.TEST) ? SafeApi : null;
