import { shell } from 'electron';
import path from 'path';
import keytar from 'keytar';
import Uploader from './Uploader';
import Downloader from './Downloader';
import { I18n } from 'react-redux-i18n';
import safeApp from 'safe-app';
import pkg from '../package.json';
import { parseUrl } from './utils';

const SERVICE = 'WEB_HOST_MANAGER';
const ACCOUNT = 'SAFE_USER';
const APP_INFO = {
  data: {
    id: pkg.identifier,
    scope: null,
    name: pkg.name,
    vendor: pkg.author.name
  },
  opt: {
    own_container: false
  },
  permissions: { // TODO check permissions are right
    _public: [
      'Read',
      'Insert',
      'Update',
      'Delete',
      'ManagePermissions'
    ],
    _publicNames: [
      'Read',
      'Insert',
      'Update',
      'Delete',
      'ManagePermissions'
    ]
  }
};

export const AUTH_RES_TYPES = {
  containers: 'containers',
  revoked: 'revoked'
};

export const accessContainers = {
  public: '_public',
  publicNames: '_publicNames'
};

export const TAG_TYPE_DNS = 15001;
export const TAG_TYPE_WWW = 15002;


let publicIds = {};
let uploader;
let downloader;

export let safe = null;

const getLocalAuthInfo = () => {
  return keytar.getPassword(SERVICE, ACCOUNT);
};

const clearLocalAuthInfo = () => {
  return keytar.deletePassword(SERVICE, ACCOUNT);
};

export const hasLocalAuthInfo = () => {
  return getLocalAuthInfo();
};

export const saveAuthInfo = (authInfo) => {
  return keytar.addPassword(SERVICE, ACCOUNT, JSON.stringify(authInfo)); // TODO check authInfo type
};

export const authorise = () => {
  const authInfo = getLocalAuthInfo(); // TODO if authInfo is null => authorise app
  if (authInfo) {
    return authInfo;
  }
  return safeApp.initializeApp(APP_INFO.data)
    .then((app) => app.auth.genAuthUri(APP_INFO.permissions, APP_INFO.opt))
    .then((res) => {
      shell.openExternal(parseUrl(res.uri))
    });
};

export const connect = (res) => {
  const authInfo = res || JSON.parse(getLocalAuthInfo());
  if (!authInfo) {
    return authorise();
  }
  return safeApp.fromAuthURI(APP_INFO.data, authInfo)
    .then((app) => {
      if (res) {
        saveAuthInfo(res);
      }
      (safe = app)
    })
    .catch((err) => {
      if (err[0] === AUTH_RES_TYPES.containers) {
        return Promise.resolve(AUTH_RES_TYPES.containers);
      } else if (err[0] === AUTH_RES_TYPES.revoked) {
        clearLocalAuthInfo();
        return Promise.resolve(AUTH_RES_TYPES.revoked);
      } else {
        clearLocalAuthInfo();
        return Promise.reject(err);
      }
    });
};

export const fetchAccessInfo = () => {
  return safe.auth.refreshContainersPermissions()
    .then(() => safe.auth.canAccessContainer(accessContainers.public))
    .then((hasAccess) => {
      if (!hasAccess) {
        return Promise.reject(new Error(`No access to ${accessContainers.public} container`));
      }
    })
    .then(() => safe.auth.canAccessContainer(accessContainers.publicNames))
    .then((hasAccess) => {
      if (!hasAccess) {
        return Promise.reject(new Error(`No access to ${accessContainers.publicNames} container`));
      }
    })
    .catch((e) => {
      clearLocalAuthInfo();
      return Promise.reject(e);
    });
};

export const fetchPublicNames = () => {
  return safe.auth.getContainer(accessContainers.publicNames)
    .then((mdata) => mdata.getKeys()
      .then((keys) => keys.len()
        .then((len) => {
          if (len === 0) {
            console.log('No public Ids found');
            return;
          }
          const encPublicIds = [];
          return keys.forEach(function (key) {
            encPublicIds.push(key);
          })
            .then(() => {
              return Promise.all(encPublicIds.map((pubId) => {
                return mdata.decrypt(pubId)
                  .then((decKey) => {
                    const decPubId = decKey.toString()
                    if (!publicIds[decPubId] || typeof publicIds[decPubId] !== 'object') {
                      publicIds[decPubId] = {};
                    }
                  })
              }));
            })
        })))
    .then(() => publicIds);
};

export const fetchServices = () => {
  const publicNamesKeys = Object.getOwnPropertyNames(publicIds);
  return Promise.all(publicNamesKeys.map((publicId) => {
    const services = {};
    return safe.auth.getContainer(accessContainers.publicNames)
      .then((mdata) => mdata.encryptKey(publicId).then((encKey) => mdata.get(encKey)).then((value) => mdata.decrypt(value.buf)))
      .then((decVal) => {
        return safe.mutableData.newPublic(decVal, TAG_TYPE_DNS)
      })
      .then((mut) => mut.getEntries()
        .then((entries) => entries.forEach((key, val) => {
          const service = key.toString();
          if ((service.indexOf('@email') !== -1) || (val.buf.length === 0)) {
            return;
          }
          services[service] = val;
        })))
      .then(() => {
        return Promise.all(Object.keys(services).map((key) => {
          return getContainerName(services[key])
            .then((val) => {
              services[key] = val;
            });
        }))
      })
      .then(() => publicIds[publicId] = services)
      .catch(Promise.reject);
  })).then(() => publicIds);
};

export const createPublicId = (publicId) => {
  publicId = publicId.trim();
  if (!publicId) {
    const err = new Error(I18n.t('messages.cannotBeEmpty', { name: 'Public Id' }));
    return Promise.reject(err);
  }
  let publicIdName = null;

  return safe.crypto.sha3Hash(publicId)
    .then((hashVal) => safe.mutableData.newPublic(hashVal, TAG_TYPE_DNS))
    .then((mdata) => {
      let permissionSet = null;
      let permissions = null;
      let pubSignKey = null;

      return safe.mutableData.newPermissionSet()
        .then((permSet) => (permissionSet = permSet))
        .then(() => permissionSet.setAllow('Insert'))
        .then(() => permissionSet.setAllow('Update'))
        .then(() => permissionSet.setAllow('Delete'))
        .then(() => permissionSet.setAllow('ManagePermissions'))
        .then(() => safe.crypto.getAppPubSignKey())
        .then((signKey) => (pubSignKey = signKey))
        .then(() => safe.mutableData.newPermissions())
        .then((perm) => (permissions = perm))
        .then(() => permissions.insertPermissionSet(pubSignKey, permissionSet))
        .then(() => safe.mutableData.newEntries())
        .then((entries) => mdata.put(permissions, entries))
        .then(() => mdata.getNameAndTag())
    })
    .then((data) => (publicIdName = data.name))
    .then(() => safe.auth.getContainer(accessContainers.publicNames))
    .then((mdata) => mdata.getEntries()
      .then((entries) => entries.mutate()
        .then((mut) => mdata.encryptKey(publicId)
          .then((encKey) => mdata.encryptValue(publicIdName)
            .then((encVal) => mut.insert(encKey, encVal)))
          .then(() => mdata.applyEntriesMutation(mut)))));
};

export const createService = (publicId, service, container) => {
  if (!publicId) {
    return Promise.reject(new Error(I18n.t('messages.cannotBeEmpty', { name: 'Public Id' })));
  }
  if (!service) {
    return Promise.reject(new Error(I18n.t('messages.cannotBeEmpty', { name: 'Service' })));
  }
  if (!container) {
    return Promise.reject(new Error(I18n.t('messages.cannotBeEmpty', { name: 'Container path' })));
  }

  return safe.auth.getContainer(accessContainers.publicNames)
    .then((mdata) => {
      return mdata.encryptKey(publicId).then((encKey) => mdata.get(encKey)).then((value) => mdata.decrypt(value.buf));
    })
    .then((val) => {
      return safe.mutableData.newPublic(val, TAG_TYPE_DNS);
    })
    .then((publicIdMData) => {
      return publicIdMData.getEntries()
        .then((entries) => {
          return entries.mutate()
            .then((mut) => {
              return mut.insert(service, container)
                .then(() => publicIdMData.applyEntriesMutation(mut));
            });
        })
    });
};

export const deleteService = (publicId, service) => {
  return safe.crypto.sha3Hash(publicId)
    .then((hashVal) => safe.mutableData.newPublic(hashVal, TAG_TYPE_DNS))
    .then((mdata) => mdata.getEntries()
      .then((entries) => entries.get(service)
        .then((val) => entries.mutate()
          .then((mut) => mut.remove(service, val.version + 1)
            .then(() => mdata.applyEntriesMutation(mut))))));
};

export const createContainer = (path) => {
  return safe.mutableData.newRandomPublic(TAG_TYPE_WWW)
    .then((mdata) => {
      return mdata.quickSetup({})
        .then(() => {
          return mdata.getNameAndTag();
        })
    })
    .then((data) => {
      return safe.auth.getContainer(accessContainers.public)
        .then((mdata) => {
          return mdata.getEntries()
            .then((entries) => {
              return entries.mutate()
                .then((mut) => {
                  return mdata.encryptKey(path)
                    .then((encKey) => mdata.encryptValue(data.name)
                      .then((encVal) => mut.insert(encKey, encVal)))
                    .then(() => mdata.applyEntriesMutation(mut));
                });
            });
        })
        .then(() => {
          return data.name;
        });
    });
};

export const getPublicContainers = () => {
  const publicKeys = [];
  return safe.auth.getContainer(accessContainers.public)
    .then((mdata) => mdata.getKeys())
    .then((keys) => {
      return keys.len()
        .then((len) => {
          if (len === 0) {
            return Promise.resolve([]);
          }
          return keys.forEach((key) => {
            publicKeys.unshift(key.toString());
          });
        });
    })
    .then(() => publicKeys);
};

export const deleteItem = (nwPath) => {
  let dirName = nwPath;
  let fileName = null;
  if (path.extname(nwPath)) {
    dirName = path.dirname(nwPath);
    fileName = path.basename(nwPath);
  }

  return safe.auth.getContainer(accessContainers.public)
  // .then((mdata) => mdata.getEntries()
    .then((mdata) => {
      if (fileName) {
        return mdata.encryptKey(dirName).then((encKey) => mdata.get(encKey)).then((value) => mdata.decrypt(value.buf))
          .then((val) => {
            return safe.mutableData.newPublic(val, TAG_TYPE_WWW)
              .then((dirMdata) => dirMdata.getEntries()
                .then(() => dirMdata.getEntries()
                  .then((dirEntries) => dirEntries.get(fileName)
                    .then((val) => dirEntries.mutate()
                      .then((mut) => mut.remove(fileName, val.version + 1)
                        .then(() => dirMdata.applyEntriesMutation(mut)))))))
          });
      } else {
        return mdata.encryptKey(nwPath.split('/').slice(0, -1).join('/')).then((encKey) => mdata.get(encKey)).then((value) => mdata.decrypt(value.buf))
          .then((val) => {
            return safe.mutableData.newPublic(val, TAG_TYPE_WWW)
              .then((tarMdata) => {
                const targetKeys = [];
                return tarMdata.getEntries()
                  .then((entries) => entries.forEach((key, val) => {
                    const keyStr = key.toString();
                    const dirname = nwPath.split('/').slice(-1).toString()
                    if (keyStr.indexOf(dirname) !== 0) {
                      return;
                    }
                    targetKeys.push({key: keyStr, version: val.version});
                  })
                    .then(() => Promise.all(targetKeys.map((tar) => {
                      return entries.mutate()
                        .then((mut) => {
                          return mut.remove(tar.key, tar.version + 1)
                            .then(() => tarMdata.applyEntriesMutation(mut))
                        });
                    }))));
              });
          });
      }
    });
};

export const remapService = (service, publicId, container) => {
  let containerName = null;
  return safe.auth.getContainer(accessContainers.public)
    .then((mdata) => mdata.encryptKey(container).then((encKey) => mdata.get(encKey)).then((value) => mdata.decrypt(value.buf)))
    // .then((entries) => entries.get(container))
    .then((val) => (containerName = val))
    .then(() => safe.auth.getContainer(accessContainers.publicNames))
    .then((mdata) => mdata.encryptKey(publicId).then((encKey) => mdata.get(encKey)).then((value) => mdata.decrypt(value.buf)))
    // .then((entries) => entries.get(publicId))
    .then((val) => safe.mutableData.newPublic(val, TAG_TYPE_DNS))
    .then((publicIdMData) => publicIdMData.getEntries()
      .then(() => publicIdMData.getEntries()
        .then((entries) => entries.get(service)
          .then((val) => entries.mutate()
            .then((mut) => mut.update(service, containerName, val.version + 1)
              .then(() => publicIdMData.applyEntriesMutation(mut)))))));
};

export const getContainer = (path) => {
  let result = [];
  return safe.auth.getContainer(accessContainers.public)
    .then((mdata) => mdata.encryptKey(path.split('/').slice(0, 3).join('/'))
      .then((encKey) => mdata.get(encKey)).then((value) => mdata.decrypt(value.buf)))
    // .then((entries) => entries.get(path.split('/').slice(0, 3).join('/')))
    .then((val) => safe.mutableData.newPublic(val, TAG_TYPE_WWW))
    .then((mdata) => {
      const files = [];
      const nfs = mdata.emulateAs('NFS');
      return mdata.getEntries()
        .then((entries) => entries.forEach((key, value) => {
          if (value.buf.length === 0) {
            return
          }
          let keyStr = key.toString();
          const rootName = path.split('/').slice(3).join('/');
          if (rootName && (keyStr.indexOf(rootName) !== 0)) {
            return
          }
          let keyStrTrimmed = keyStr;
          if (rootName.length > 0) {
            keyStrTrimmed = keyStr.substr(rootName.length + 1);
          }
          if (keyStrTrimmed.split('/').length > 1) {
            const dirName = keyStrTrimmed.split('/')[0];
            if (result.filter((files) => files.name === dirName).length === 0) {
              return result.unshift({ isFile: false, name: dirName });
            }
            return;
          }
          files.unshift(keyStr);
        }))
        .then(() => {
          return Promise.all(files.map((file) => {
            return nfs.fetch(file)
              .then((f) => safe.immutableData.fetch(f.dataMapName))
              .then((i) => i.read())
              .then((co) => {
                const dirName = path.split('/').slice(3).join('/');
                result.unshift({
                  isFile: true,
                  name: dirName ? file.substr(dirName.length + 1) : file,
                  size: co.length
                });
              });
          }));
        });
    })
    .then(() => result);
};

export const upload = (localPath, networkPath, progressCallback, errorCallback) => {
  uploader = new Uploader(localPath, networkPath, progressCallback, errorCallback);
  uploader.start();
};

export const cancelUpload = () => {
  uploader.cancel();
};

export const download = (networkPath, callback) => {
  downloader = new Downloader(networkPath, callback);
  downloader.start();
};

export const cancelDownload = () => {
  downloader.cancel();
};

export const checkServiceExist = (publicId, service, path) => {
  return safe.auth.getContainer(accessContainers.publicNames)
    .then((mdata) => mdata.encryptKey(publicId).then((encKey) => mdata.get(encKey)).then((value) => mdata.decrypt(value.buf)))
    .then((decVal) => {
      return safe.mutableData.newPublic(decVal, TAG_TYPE_DNS)
    })
    .then((pubMut) => {
      return pubMut.get(service)
        .then((value) => {
          if (value.buf.length !== 0) {
            return;
          }
          return safe.auth.getContainer(accessContainers.public)
            .then((mdata) => {
              return mdata.encryptKey(path).then((encKey) => mdata.get(encKey)).then((value) => mdata.decrypt(value.buf))
            })
            .then((val) => {
              return pubMut.getEntries()
                .then((entries) => {
                  return entries.mutate().then((mut) => {
                    return mut.update(service, val, value.version + 1).then(() => pubMut.applyEntriesMutation(mut));
                  });
                });
            });
        })
        .catch((err) => {
          if (err.code === -106) {
            return Promise.resolve(false);
          }
          return Promise.reject();
        });
    });
};

const getContainerName = (mdataName) => {
  let res = null;
  return safe.auth.getContainer(accessContainers.public)
    .then((mdata) => mdata.getEntries()
      .then((entries) => entries.forEach((key, val) => {
        if (val.buf.equals(mdataName.buf)) {
          res = key.toString();
        }
      })))
    .then(() => res);
};
