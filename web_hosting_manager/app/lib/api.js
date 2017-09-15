/**
 * SafeApi class expose all api requested for web hosting manager.
 */
import { shell } from 'electron';
import path from 'path';
import safeApp from '@maidsafe/safe-node-app';
import { I18n } from 'react-redux-i18n';

import Uploader from './Uploader';
import Downloader from './Downloader';
import * as utils from './utils';
import CONSTANTS from '../constants';

class SafeApi {
  constructor() {
    this.app = null;
    this.APP_INFO = CONSTANTS.APP_INFO;
    this.publicNames = {};
    this.uploader = null;
    this.downloader = null;
  }

  mockRes(err) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        if (err) {
          return rej(new Error(err))
        }
        res()
      }, 2000);
    });
  }

  /**
   * Authorise with SAFE Authenticator
   * @return {Promise}
   */
  sendAuthReq() {
    return safeApp.initializeApp(this.APP_INFO.data)
      .then((app) => app.auth.genAuthUri(this.APP_INFO.permissions, this.APP_INFO.opt))
      .then((res) => utils.openExternal(res.uri));
  }

  /**
   * CONNECT with SAFE Network
   * @param uri
   * @return {*}
   */
  connect(uri, nwStateChangeCb) {
    const authInfo = uri;
    if (!authInfo) {
      return Promise.reject(new Error('Missing Authorisation information.'));
    }
    return safeApp.fromAuthURI(this.APP_INFO.data, authInfo, nwStateChangeCb)
      .then((app) => {
        // store Auth response
        if (uri) {
          utils.localAuthInfo.save(uri);
        }
        nwStateChangeCb(CONSTANTS.NETWORK_STATE.CONNECTED);
        this.app = app;
      })
      .catch((err) => {
        if (err[0] === CONSTANTS.AUTH_RES_TYPE.CONTAINERS) {
          return Promise.resolve(CONSTANTS.AUTH_RES_TYPE.CONTAINERS);
        } else if (err[0] === CONSTANTS.AUTH_RES_TYPE.REVOKED) {
          utils.localAuthInfo.clear();
          return Promise.resolve(CONSTANTS.AUTH_RES_TYPE.REVOKED);
        } else {
          utils.localAuthInfo.clear();
          return Promise.reject(err);
        }
      });
  }

  reconnect() {
    return this.app.reconnect();
  }

  sendMDReq(mdPermissions) {
    return this.app.auth.genShareMDataUri(mdPermissions)
      .then((res) => utils.openExternal(res.uri));
  }

  authoriseMD(publicName) {
    return this.getPublicNamesContainer()
    .then((md) => this.getMDataValueForKey(md, publicName))
    .then((xorName) => this.sendMDReq([{
      type_tag: CONSTANTS.TAG_TYPE.DNS,
      name: xorName,
      perms: ['Insert', 'Update', 'Delete']
    }]))
  }

  connectSharedMD(resURI) {
    return safeApp.fromAuthURI(this.APP_INFO.data, resURI)
      .then((res) => {
        console.log('connected with MD');
      });
  }

  openLogFile() {
    if (!this.app) {
      return;
    }
    this.app.logPath().then(shell.openItem);
  }

  /**
   * Check access containers accessible
   * @return {*}
   */
  canAccessContainers() {
    if (!this.app) {
      return Promise.reject(new Error('Application is not connected.'));
    }
    return this.app.auth.refreshContainersPermissions()
      .then(() => {
        return Promise.all(
          Object.keys(CONSTANTS.ACCESS_CONTAINERS).map((cont) => {
            return this.app.auth.canAccessContainer(CONSTANTS.ACCESS_CONTAINERS[cont])
          })
        );
      })
      .catch((err) => {
        utils.localAuthInfo.clear();
        return Promise.reject(err);
      });
  }

  /**
   * Fetch Public Names
   */
  fetchPublicNames() {
    const self = this;
    return this.getPublicNamesContainer()
      .then((md) => md.getKeys()
        .then((keys) => keys.len()
          .then((keysLen) => {
            if (keysLen === 0) {
              console.warn('No Public Names found');
              return;
            }
            const encPublicNames = [];
            return keys.forEach(function (key) {
              encPublicNames.push(key);
            }).then(() => Promise.all(encPublicNames.map((key) => {
              return md.decrypt(key)
                .then((decKey) => {
                  const decPubId = decKey.toString();
                  if (decPubId === CONSTANTS.MD_META_KEY) {
                    return;
                  }
                  if (!self.publicNames[decPubId] || typeof self.publicNames[decPubId] !== 'object') {
                    self.publicNames[decPubId] = {};
                  }
                })
                .catch((err) => { // FIXME shankar - to be removed once fixed symmetric decipher failure for unknown key decryption.
                  if (err.code === CONSTANTS.ERROR_CODE.SYMMETRIC_DECIPHER_FAILURE) {
                    return Promise.resolve();
                  }
                  return Promise.reject(err);
                });
            })));
          })))
      .then(() => (self.publicNames));
  }

  /**
   * Fetch Service of Public Names
   * @return {Promise}
   */
  fetchServices() {
    const self = this;
    const publicNames = Object.getOwnPropertyNames(this.publicNames);
    return Promise.all(publicNames.map((publicName) => {
      const services = {};
      return this.getPublicNamesContainer()
        .then((md) => this.getMDataValueForKey(md, publicName))
        .then((value) => this.app.mutableData.newPublic(value, CONSTANTS.TAG_TYPE.DNS))
        .then((md) => md.getEntries()
          .then((entries) => entries.forEach((key, val) => {
            const service = key.toString();
            // check service is not an email or deleted
            if ((service.indexOf('@email') !== -1) || (val.buf.length === 0) || service === CONSTANTS.MD_META_KEY) {
              return;
            }
            services[service] = val;
          })))
        .then(() => Promise.all(Object.keys(services).map((service) => (
          self._getServicePath(services[service])
            .then((path) => {
              services[service] = path;
            })
        ))))
        .then(() => (self.publicNames[publicName] = services))
        .catch(Promise.reject);
    })).then(() => (self.publicNames));
  }

  /**
   * Create new Public Name
   * @param publicName
   * @return {Promise<R>|Promise.<*>}
   */
  createPublicName(publicName) {
    const name = publicName.trim();
    if (!name) {
      // FIXME correct error message to public name
      const err = new Error(I18n.t('messages.cannotBeEmpty', { name: 'Public Id' }));
      return Promise.reject(err);
    }

    const metaName = `Services container for: ${publicName}`;
    const metaDesc = `Container where all the services are mapped for the Public ID: ${publicName}`;

    return this.app.crypto.sha3Hash(name)
      .then((hashedName) => this.app.mutableData.newPublic(hashedName, CONSTANTS.TAG_TYPE.DNS))
      .then((md) => {
        return md.quickSetup({}, metaName, metaDesc)
          .then(() => md.getNameAndTag())
          .then((mdMeta) => this.getPublicNamesContainer()
            .then((pubMd) => this._insertToMData(pubMd, name, mdMeta.name, true)));
      });
  }

  /**
   * Create new Service
   * @param publicName
   * @param serviceName
   * @param path
   * @return {*}
   */
  createService(publicName, serviceName, pathXORName) {
    if (!publicName) {
      return Promise.reject(new Error(I18n.t('messages.cannotBeEmpty', { name: 'Public Id' })));
    }
    if (!serviceName) {
      return Promise.reject(new Error(I18n.t('messages.cannotBeEmpty', { name: 'Service' })));
    }
    if (!path) {
      return Promise.reject(new Error(I18n.t('messages.cannotBeEmpty', { name: 'Container path' })));
    }

    return this.getPublicNamesContainer()
      .then((md) => this.getMDataValueForKey(md, publicName))
      .then((decVal) => this.app.mutableData.newPublic(decVal, CONSTANTS.TAG_TYPE.DNS))
      .then((md) => this._insertToMData(md, serviceName, pathXORName)
        .catch((err) => {
          if (err.code !== CONSTANTS.ERROR_CODE.ENTRY_EXISTS) {
            return Promise.reject(err);
          }
          return this._updateMDataKey(md, serviceName, pathXORName);
        }));
  }

  /**
   * Delete Service
   * @param publicName
   * @param serviceName
   */
  deleteService(publicName, serviceName) {
    return this.app.crypto.sha3Hash(publicName)
      .then((hashedPubName) => this.app.mutableData.newPublic(hashedPubName, CONSTANTS.TAG_TYPE.DNS))
      .then((md) => this._removeFromMData(md, serviceName));
  }

  createServiceContainer(path, meta) {
    const metaName = `Service Root Directory for: ${meta}`;
    const metaDesc = `Has the files hosted for the service: ${meta}`;
    return this.app.mutableData.newRandomPublic(CONSTANTS.TAG_TYPE.WWW)
      .then((md) => md.quickSetup({}, metaName, metaDesc).then(() => md.getNameAndTag()))
      .then((mdMeta) => this.getPublicContainer()
        .then((pubMd) => this._insertToMData(pubMd, path, mdMeta.name))
        .then(() => mdMeta.name));
  }

  checkPublicNameAccessible(publicName) {
    return this.getPublicNamesContainer()
        .then((md) => this.getMDataValueForKey(md, publicName))
        .then((decVal) => this.app.mutableData.newPublic(decVal, CONSTANTS.TAG_TYPE.DNS))
        .then((md) => this._checkMDAccessible(md));
  }

  getPublicContainerKeys() {
    const publicKeys = [];
    return this.getPublicContainer()
      .then((pubMd) => pubMd.getKeys())
      .then((keys) => keys.len()
        .then((len) => {
          if (len === 0) {
            return Promise.resolve([]);
          }
          return keys.forEach((key) => {
            if (!key) {
              return;
            }
            publicKeys.unshift(key.toString());
          }).then(() => publicKeys);
        }));
  }

  deleteFileOrDir(netPath) {
    const containerName = netPath.split('/').slice(0, 3).join('/');
    let containerKey = netPath.slice(containerName.length);
    if (containerKey[0] === '/') {
      containerKey = containerKey.slice(1);
    }

    const deleteFiles = (nfs, files) => {
      if (files.length === 0) {
        return;
      }
      const file = files[0]
      return nfs.fetch(file.key)
        .then((f) => nfs.delete(file.key, f.version + 1))
        .then(() => {
          files.shift();
          return deleteFiles(nfs, files);
        });
    };

    return this.getPublicContainer()
      .then((pubMd) => {
        return this.getMDataValueForKey(pubMd, containerName)
          .then((val) => this.app.mutableData.newPublic(val, CONSTANTS.TAG_TYPE.WWW))
          .then((dirMd) => {
            const fileKeys = [];
            return dirMd.getEntries()
              .then((entries) => entries.forEach((key, val) => {
                const keyStr = key.toString();
                if ((keyStr.indexOf(containerKey) !== 0) || keyStr === CONSTANTS.MD_META_KEY) {
                  return;
                }
                if (val.buf.length === 0) {
                  return;
                }
                fileKeys.push({ key: keyStr, version: val.version });
              }).then(() => {
                const nfs = dirMd.emulateAs('NFS');
                return deleteFiles(nfs, fileKeys);
              }));
          });
      });
  }

  remapService(publicName, serviceName, path) {
    return this.getPublicContainer()
      .then((pubMd) => this.getMDataValueForKey(pubMd, path))
      .then((containerVal) => {
        return this.getPublicNamesContainer()
          .then((pnMd) => this.getMDataValueForKey(pnMd, publicName))
          .then((pnVal) => this.app.mutableData.newPublic(pnVal, CONSTANTS.TAG_TYPE.DNS))
          .then((md) => this._updateMDataKey(md, serviceName, containerVal));
      });
  }

  getServiceContainer(path) {
    return this.getPublicContainer()
      .then((md) => this.getMDataValueForKey(md, path.split('/').slice(0, 3).join('/')))
      .then((val) => this.app.mutableData.newPublic(val, CONSTANTS.TAG_TYPE.WWW))
      .then((serMd) => {
        const files = [];
        let result = [];
        const rootName = path.split('/').slice(3).join('/');
        return this._checkMDAccessible(serMd).then(() => serMd.getEntries())
          .then((entries) => entries.forEach((key, val) => {
            if (val.buf.length === 0) {
              return;
            }
            let keyStr = key.toString();
            if ((rootName && (keyStr.indexOf(rootName) !== 0)) || keyStr === CONSTANTS.MD_META_KEY) {
              return;
            }
            let keyStrTrimmed = keyStr;
            if (rootName.length > 0) {
              keyStrTrimmed = keyStr.substr(rootName.length + 1);
            }
            if (keyStrTrimmed.split('/').length > 1) {
              const dirName = keyStrTrimmed.split('/')[0];
              if (result.filter((files) => (files.name === dirName)).length === 0) {
                return result.unshift({ isFile: false, name: dirName });
              }
              return;
            }
            files.unshift(keyStr);
          })).then(() => {
            const nfs = serMd.emulateAs('NFS');
            return Promise.all(files.map((file) => {
              return nfs.fetch(file)
                .then((f) => nfs.open(f, CONSTANTS.FILE_OPEN_MODE.OPEN_MODE_READ))
                .then((f) => f.size())
                .then((size) => {
                  const dirName = path.split('/').slice(3).join('/');
                  result.unshift({
                    isFile: true,
                    name: dirName ? file.substr(dirName.length + 1) : file,
                    size: size
                  });
                });
            })).then(() => result);
          });
      });
  }

  getServiceContainerMeta(path) {
    return this.getPublicContainer()
      .then((md) => this.getMDataValueForKey(md, path))
      .then((val) => this.app.mutableData.newPublic(val, CONSTANTS.TAG_TYPE.WWW))
      .then((serMd) => serMd.getNameAndTag());
  }

  updateServiceIfExist(publicName, serviceName, path) {
    return this.getPublicNamesContainer()
      .then((pnMd) => this.getMDataValueForKey(pnMd, publicName))
      .then((val) => this.app.mutableData.newPublic(val, CONSTANTS.TAG_TYPE.DNS))
      .then((md) => {
        return md.get(serviceName)
          .then((value) => {
            if (value.buf.length !== 0) {
              return;
            }
            return this.getPublicContainer()
              .then((pubMd) => this.getMDataValueForKey(pubMd, path))
              .then((val) => this._updateMDataKey(md, serviceName, val));
          })
          .catch((err) => {
            if (err.code === CONSTANTS.ERROR_CODE.NO_SUCH_ENTRY) {
              return Promise.resolve(false);
            }
            return Promise.reject();
          });
      });
  }

  fileUpload(localPath, networkPath, progressCallback, errorCallback) {
    this.uploader = new Uploader(localPath, networkPath, progressCallback, errorCallback);
    this.uploader.start();
  };

  cancelFileUpload() {
    this.uploader.cancel();
  }

  fileDownload(networkPath, callback) {
    this.downloader = new Downloader(networkPath, callback);
    this.downloader.start();
  }

  cancelFileDownload = () => {
    this.downloader.cancel();
  }

  getPublicContainer() {
    if (!this.app) {
      return Promise.reject(new Error('Application is not connected.'));
    }
    return this.app.auth.getContainer(CONSTANTS.ACCESS_CONTAINERS.PUBLIC);
  }

  getPublicNamesContainer() {
    if (!this.app) {
      return Promise.reject(new Error('Application is not connected.'));
    }
    return this.app.auth.getContainer(CONSTANTS.ACCESS_CONTAINERS.PUBLIC_NAMES);
  }

  getMDataValueForKey(md, key) {
    return md.encryptKey(key)
      .then((encKey) => md.get(encKey))
      .then((value) => md.decrypt(value.buf));
  }

  _checkMDAccessible(md) {
    return md.getPermissions()
      .then((perm) => this.app.crypto.getAppPubSignKey()
        .then((signKey) => perm.getPermissionSet(signKey)));
  }

  _updateMDataKey(md, key, value) {
    return md.getEntries()
      .then((entries) => entries.get(key)
        .then((val) => entries.mutate()
          .then((mut) => mut.update(key, value, val.version + 1)
            .then(() => md.applyEntriesMutation(mut)))));
  }

  _deleteQueue(nfsHandle, serviceFileEntryKeys, i) {
    if (i === serviceFileEntryKeys.length) {
      return Promise.resolve("Files deleted");
    }
    return nfsHandle.fetch(serviceFileEntryKeys[i])
      .then((file) => {
        return nfsHandle.delete(serviceFileEntryKeys[i], file.version + 1);
      })
      .then(() => this._deleteQueue(nfsHandle, serviceFileEntryKeys, i + 1));
  }

  _removeFromMData(md, key) {
    let serviceFileEntryKeys = [];
    return md.getEntries()
      .then((entries) => entries.get(key)
        .then((value) => this.app.mutableData.newPublic(value.buf, CONSTANTS.TAG_TYPE.WWW)
          .then((serviceHandle) => serviceHandle.getKeys()
            .then((keys) => keys.forEach((k) => { serviceFileEntryKeys.push(String.fromCharCode.apply(null, k)) }))
            .then(() => serviceHandle.emulateAs('NFS'))
            .then((nfsHandle) => this._deleteQueue(nfsHandle, serviceFileEntryKeys.filter((key) => key !== "_metadata"), 0))
            .then((res) => {
                return entries.mutate()
                  .then((mut) => mut.remove(key, value.version + 1)
                    .then(() => md.applyEntriesMutation(mut)))
              }
            )
          )
        )
      );
  }

  _insertToMData(md, key, val, toEncrypt) {
    let keyToInsert = key;
    let valToInsert = val;

    return md.getEntries()
      .then((entries) => entries.mutate()
        .then((mut) => {
          if (toEncrypt) {
            return md.encryptKey(key)
              .then((encKey) => md.encryptValue(val)
                .then((encVal) => {
                  keyToInsert = encKey;
                  valToInsert = encVal
                })).then(() => mut);
          }
          return mut;
        })
        .then((mut) => mut.insert(keyToInsert, valToInsert)
          .then(() => md.applyEntriesMutation(mut))));
  }

  _getServicePath(serviceXorName) {
    let path = null;
    return this.getPublicContainer()
      .then((md) => md.getEntries()
        .then((entries) => entries.forEach((key, val) => {
          if (val.buf.equals(serviceXorName.buf)) {
            path = key.toString();
          }
        }))).then(() => path);
  }
}
const safeApi = new SafeApi();
export default safeApi;
