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

export const accessContainers = {
  public: '_public',
  publicNames: '_publicNames'
};

export const typetag = 15001;

let publicIds = {};
let uploader;
let downloader;

export let safe = null;

const getLocalAuthInfo = () => {
  return keytar.getPassword(SERVICE, ACCOUNT);
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

export const connect = () => {
  const authInfo = JSON.parse(getLocalAuthInfo());
  if (!authInfo.data) {
    return Promise.reject(new Error('Improper auth data'));
  }
  return safeApp.fromAuthURI(APP_INFO.data, authInfo.data)
    .then((app) => (safe = app));
};

export const fetchAccessInfo = () => {
  return safe.auth.refreshContainerAccess()
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
      keytar.deletePassword(SERVICE, ACCOUNT);
      return Promise.reject(e);
    });
};

export const fetchPublicNames = () => {
  return safe.auth.getAccessContainerInfo(accessContainers.publicNames)
    .then((mdata) => mdata.getKeys())
    .then((keys) => keys.len()
      .then((len) => {
        if (len === 0) {
          console.log('No public Ids found');
          return;
        }
        return keys.forEach(function (key) {
          if (!publicIds[key] || typeof publicIds[key] !== 'object') {
            publicIds[key.toString()] = {};
          }
        })
      }))
    .then(() => publicIds);
};

export const fetchServices = () => {
  const publicNamesKeys = Object.getOwnPropertyNames(publicIds);
  return Promise.all(publicNamesKeys.map((publicId) => {
    const services = {};
    return safe.auth.getAccessContainerInfo(accessContainers.publicNames)
      .then((mdata) => mdata.getEntries())
      // get publicName mdata
      .then((entries) => entries.get(publicId))
      .then((value) => safe.mutableData.newPublic(value.buf, typetag))
      // get services
      .then((mut) => mut.getEntries()
        .then((entries) => entries.forEach((key, val, version) => {
          services[key.toString()] = val;
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

// export const fetchServiceContents = () => {
//   return mock(true);
// };

export const createPublicId = (publicId) => {
  publicId = publicId.trim();
  if (!publicId) {
    const err = new Error(I18n.t('messages.cannotBeEmpty', { name: 'Public Id' }));
    return Promise.reject(err);
  }
  let publicIdName = null;

  return safe.crypto.sha3Hash(publicId)
    .then((hashVal) => safe.mutableData.newPublic(hashVal, typetag))
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
    .then(() => safe.auth.getAccessContainerInfo(accessContainers.publicNames))
    .then((mdata) => mdata.getEntries()
      .then((entries) => entries.mutate()
        .then((mut) => mut.insert(publicId, publicIdName)
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

  return safe.auth.getAccessContainerInfo(accessContainers.publicNames)
    .then((mdata) => mdata.getEntries())
    .then((entries) => entries.get(publicId))
    .then((val) => safe.mutableData.newPublic(val.buf, typetag))
    .then((publicIdMData) => publicIdMData.getEntries()
      .then((entries) => entries.mutate()
        .then((mut) => mut.insert(service, container)
          .then(() => publicIdMData.applyEntriesMutation(mut)))));
};

export const deleteService = (publicId, service) => {
  return safe.crypto.sha3Hash(publicId)
    .then((hashVal) => safe.mutableData.newPublic(hashVal, typetag))
    .then((mdata) => mdata.getEntries()
      .then((entries) => entries.get(service)
        .then((val) => entries.mutate()
          .then((mut) => mut.remove(service, val.version + 1)
            .then(() => mdata.applyEntriesMutation(mut))))));
};

export const createContainer = (path) => {
  return safe.mutableData.newRandomPublic(typetag)
    .then((mdata) => mdata.quickSetup({})
      .then(() => mdata.getNameAndTag()))
    .then((data) => safe.auth.getAccessContainerInfo(accessContainers.public)
      .then((mdata) => mdata.getEntries()
        .then((entries) => entries.mutate()
          .then((mut) => mut.insert(path, data.name)
            .then(() => mdata.applyEntriesMutation(mut)))))
      .then(() => data.name));
};

export const getPublicContainers = () => {
  const publicKeys = [];
  return safe.auth.getAccessContainerInfo(accessContainers.public)
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

  return safe.auth.getAccessContainerInfo(accessContainers.public)
    .then((mdata) => mdata.getEntries()
      .then((entries) => {
        if (fileName) {
          return entries.get(dirName)
            .then((val) => {
              return safe.mutableData.newPublic(val.buf, typetag)
                .then((dirMdata) => dirMdata.getEntries()
                  .then(() => dirMdata.getEntries()
                    .then((dirEntries) => dirEntries.get(fileName)
                      .then((val) => dirEntries.mutate()
                        .then((mut) => mut.remove(fileName, val.version + 1)
                          .then(() => dirMdata.applyEntriesMutation(mut)))))))
            });
        } else {
          return entries.get(nwPath)
            .then((val) => entries.mutate()
              .then((mut) => mut.remove(nwPath, val.version + 1)
                .then(() => mdata.applyEntriesMutation(mut))));
        }
      }));
};

export const remapService = (service, publicId, container) => {
  let containerName = null;
  return safe.auth.getAccessContainerInfo(accessContainers.public)
    .then((mdata) => mdata.getEntries())
    .then((entries) => entries.get(container))
    .then((val) => (containerName = val.buf))
    .then(() => safe.auth.getAccessContainerInfo(accessContainers.publicNames))
    .then((mdata) => mdata.getEntries())
    .then((entries) => entries.get(publicId))
    .then((val) => safe.mutableData.newPublic(val.buf, typetag))
    .then((publicIdMData) => publicIdMData.getEntries()
      .then(() => publicIdMData.getEntries()
        .then((entries) => entries.get(service)
          .then((val) => entries.mutate()
            .then((mut) => mut.update(service, containerName, val.version + 1)
              .then(() => publicIdMData.applyEntriesMutation(mut)))))));
};

export const getContainer = (path) => {
  let result = [];
  return safe.auth.getAccessContainerInfo(accessContainers.public)
    .then((mdata) => mdata.getEntries())
    .then((entries) => entries.get(path.split('/').slice(0, 3).join('/')))
    .then((val) => safe.mutableData.newPublic(val.buf, typetag))
    .then((mdata) => {
      const files = [];
      const nfs = mdata.emulateAs('NFS');
      return mdata.getKeys()
        .then((keys) => keys.forEach((key) => {
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
                result.unshift({ isFile: true, name: dirName ? file.substr(dirName.length + 1) : file, size: co.length });
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

const getContainerName = (mdataName) => {
  let res = null;
  return safe.auth.getAccessContainerInfo(accessContainers.public)
    .then((mdata) => mdata.getEntries()
      .then((entries) => entries.forEach((key, val) => {
        if (val.buf.equals(mdataName.buf)) {
          res = key.toString();
        }
      })))
    .then(() => res);
};
