/* global btoa, safeAuth, safeNFS safeCipherOpts, safeStructuredData, safeDataId */

// this is only file directly interacting with SAFE
import crypto from 'crypto';
import { APP_ID, APP_VERSION, APP_INFO, CONTAINERS, TYPE_TAG } from './config.js'

const requiredWindowObj = [
  'safeApp',
  'safeMutableData',
  'safeMutableDataEntries',
  'safeImmutableData',
  'safeMutableDataPermissionsSet',
  'safeMutableDataPermissions',
  'safeNfs'
];

requiredWindowObj.forEach((obj) => {
  if (!window.hasOwnProperty(obj)) {
    throw new Error(`${obj} not found. Please check beaker-plugin-safe-app`);
  }
});

const INDEX_FILE_NAME = crypto.createHash('sha256').update(`${window.location.host}-${APP_ID}`).digest('hex');
const RES_URI_KEY = 'SAFE_RES_URI';

// global access state
let ACCESS_TOKEN;
let FILE_INDEX;

const _saveResponseUri = (uri) => {
  if (typeof uri !== 'string') {
    throw new Error('URI is not a String');
  }
  window.localStorage.setItem(RES_URI_KEY, uri);
};

const _getResponseUri = () => {
  return window.localStorage.getItem(RES_URI_KEY);
};

const _connectAuthorised = (token, resUri) => {
  return window.safeApp.connectAuthorised(token, resUri)
    .then((token) => (ACCESS_TOKEN = token));
};

const _getBufferedFileIndex = () => {
  if (typeof FILE_INDEX !== 'object') {
    throw new Error('FILE INDEX is not an Object');
  }
  return new Buffer(JSON.stringify(FILE_INDEX));
};

const _fetchAccessInfo = () => {
  return window.safeApp.canAccessContainer(ACCESS_TOKEN, '_public')
    .then((hasAccess) => {
      if (!hasAccess) {
        throw new Error('Cannot access PUBLIC Container');
      }
      return true;
    });
};

const _createMdata = () => {
  FILE_INDEX = {};
  return window.safeMutableData.newRandomPublic(ACCESS_TOKEN, TYPE_TAG)
    .then((mdata) => {
      let permSetHandle = null;
      let pubSignKeyHandle = null;
      let permHandle = null;

      return window.safeMutableData.newPermissionSet(ACCESS_TOKEN)
        .then((permSet) => (permSetHandle = permSet))
        .then(() => window.safeMutableDataPermissionsSet.setAllow(ACCESS_TOKEN, permSetHandle, 'Insert'))
        .then(() => window.safeMutableDataPermissionsSet.setAllow(ACCESS_TOKEN, permSetHandle, 'Update'))
        .then(() => window.safeMutableDataPermissionsSet.setAllow(ACCESS_TOKEN, permSetHandle, 'Delete'))
        .then(() => window.safeMutableDataPermissionsSet.setAllow(ACCESS_TOKEN, permSetHandle, 'ManagePermissions'))
        .then(() => window.safeApp.getPubSignKey(ACCESS_TOKEN))
        .then((signKey) => (pubSignKeyHandle = signKey))
        .then(() => window.safeMutableData.newPermissions(ACCESS_TOKEN))
        .then((perm) => (permHandle = perm))
        .then(() => window.safeMutableDataPermissions.insertPermissionsSet(ACCESS_TOKEN, permHandle, pubSignKeyHandle, permSetHandle))
        .then(() => window.safeMutableData.newEntries(ACCESS_TOKEN))
        .then((entriesHandle) => window.safeMutableDataEntries.insert(ACCESS_TOKEN, entriesHandle, 'FILE_INDEX', _getBufferedFileIndex())
          .then(() => window.safeMutableData.put(ACCESS_TOKEN, mdata, permHandle, entriesHandle)))
        .then(() => window.safeMutableData.getNameAndTag(ACCESS_TOKEN, mdata));
    })
    .then((mdataInfo) => {
      return window.safeApp.getContainer(ACCESS_TOKEN, '_public')
        .then((mdata) => window.safeMutableData.getEntries(ACCESS_TOKEN, mdata)
          .then((entries) => window.safeMutableDataEntries.mutate(ACCESS_TOKEN, entries)
            .then((mut) => window.safeMutableDataMutation.insert(ACCESS_TOKEN, mut, INDEX_FILE_NAME, mdataInfo.name)
              .then(() => window.safeMutableData.applyEntriesMutation(ACCESS_TOKEN, mdata, mut)))));
    });
};

export const authorise = () => {
  if (ACCESS_TOKEN) return Promise.resolve(ACCESS_TOKEN);

  const responseUri = _getResponseUri();

  return window.safeApp.initialise(APP_INFO)
    .then((token) => {
      if (responseUri) {
        return _connectAuthorised(token, responseUri);
      }
      return window.safeApp.authorise(token, CONTAINERS)
        .then((resUri) => {
          _saveResponseUri(resUri);
          return _connectAuthorised(token, resUri);
        });
    })
    .then(() => _fetchAccessInfo());
};

export const getFileIndex = () => {
  if (FILE_INDEX) return Promise.resolve(FILE_INDEX);

  return window.safeApp.getContainer(ACCESS_TOKEN, '_public')
    .then((mdata) => window.safeMutableData.getEntries(ACCESS_TOKEN, mdata))
    .then((entries) => window.safeMutableDataEntries.get(ACCESS_TOKEN, entries, INDEX_FILE_NAME))
    .then((value) => window.safeMutableData.newPublic(ACCESS_TOKEN, value.buf, TYPE_TAG)
      .then((mdata) => window.safeMutableData.getEntries(ACCESS_TOKEN, mdata))
      .then((entries) => window.safeMutableDataEntries.get(ACCESS_TOKEN, entries, 'FILE_INDEX'))
      .then((fileIndex) => {
        FILE_INDEX = JSON.parse(fileIndex.buf.toString());
        return FILE_INDEX;
      })
      .catch(console.error)
    )
    .catch(() => {
      console.warn('Creating new record');
      return _createMdata();
    });
};

const _prepareFile = (oldData, newData) => {
  if (!(oldData && Array.isArray(oldData))) {
    throw new Error('oldData is not an Array');
  }
  oldData.push({
    ts: (new Date()).getTime(),
    content: newData
  });
  return new Buffer(JSON.stringify(oldData));
};

const _getFile = (mdata, filename) => {
  return window.safeMutableData.emulateAs(ACCESS_TOKEN, mdata, 'NFS')
    .then((nfs) => window.safeNfs.fetch(ACCESS_TOKEN, nfs, filename))
    .then((file) => {
      return window.safeNfs.getFileMeta(file)
        .then((meta) => window.safeImmutableData.fetch(ACCESS_TOKEN, meta.dataMapName)
          .then((immut) => window.safeImmutableData.read(ACCESS_TOKEN, immut))
          .then((data) => ({
            data: JSON.parse(data.toString()),
            version: meta.version
          })))
    });
};

export const readFile = (filename, version) => {
  return window.safeApp.getContainer(ACCESS_TOKEN, '_public')
    .then((mdata) => window.safeMutableData.getEntries(ACCESS_TOKEN, mdata))
    .then((entries) => window.safeMutableDataEntries.get(ACCESS_TOKEN, entries, INDEX_FILE_NAME)
      .then((value) => window.safeMutableData.newPublic(ACCESS_TOKEN, value.buf, TYPE_TAG)
        .then((mdata) => _getFile(mdata, filename))
        .then((file) => {
          return version ? file.data[version] : file.data
        })));
};

export const getFileVersions = (filename) => {
  return readFile(filename);
};

const _updateFile = (filename, payload) => {
  return window.safeApp.getContainer(ACCESS_TOKEN, '_public')
    .then((mdata) => window.safeMutableData.getEntries(ACCESS_TOKEN, mdata))
    .then((entries) => window.safeMutableDataEntries.get(ACCESS_TOKEN, entries, INDEX_FILE_NAME))
    .then((value) => window.safeMutableData.newPublic(ACCESS_TOKEN, value.buf, TYPE_TAG))
    .then((mdata) => {
      return _getFile(mdata, filename)
        .then((files) => window.safeMutableData.emulateAs(ACCESS_TOKEN, mdata, 'NFS')
          .then((nfs) => window.safeNfs.create(ACCESS_TOKEN, nfs, _prepareFile(files.data, payload))
            .then((file) => window.safeNfs.update(ACCESS_TOKEN, nfs, file, filename, parseInt(files.version, 10) + 1))));
    });
};

export const saveFile = (filename, data) => {
  if (FILE_INDEX[filename]) {
    // this was an edit, add new version
    console.log("existing");
    return _updateFile(filename, data);
  } else {
    return window.safeApp.getContainer(ACCESS_TOKEN, '_public')
      .then((publicMdHandle) => window.safeMutableData.getEntries(ACCESS_TOKEN, publicMdHandle))
      .then((entHandle) => window.safeMutableDataEntries.get(ACCESS_TOKEN, entHandle, INDEX_FILE_NAME))
      .then((value) => window.safeMutableData.newPublic(ACCESS_TOKEN, value.buf, TYPE_TAG)
        .then((mdata) => window.safeMutableData.emulateAs(ACCESS_TOKEN, mdata, 'NFS')
          .then((nfs) => {
            return window.safeNfs.create(ACCESS_TOKEN, nfs, _prepareFile([], data))
              .then((file) => window.safeNfs.insert(ACCESS_TOKEN, nfs, file, filename));
          })
          .then(() => window.safeMutableData.getEntries(ACCESS_TOKEN, mdata)
            .then((entriesHandle) => {
              return window.safeMutableDataEntries.get(ACCESS_TOKEN, entriesHandle, 'FILE_INDEX')
                .then((val) => {
                  return window.safeMutableDataEntries.mutate(ACCESS_TOKEN, entriesHandle)
                    .then((mut) => {
                      FILE_INDEX[filename] = 1;
                      return window.safeMutableDataMutation.update(ACCESS_TOKEN, mut, 'FILE_INDEX', _getBufferedFileIndex(), (parseInt(val.version, 10) + 1))
                        .then(() => window.safeMutableData.applyEntriesMutation(ACCESS_TOKEN, mdata, mut));
                    })
                })
            }))));
  }
};
