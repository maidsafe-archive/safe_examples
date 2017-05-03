/* global btoa, safeAuth, safeNFS safeCipherOpts, safeStructuredData, safeDataId */
import crypto from 'crypto';
import { APP_ID, APP_INFO, CONTAINERS, TYPE_TAG } from './config.js';

const requiredWindowObj = [
  'safeApp',
  'safeMutableData',
  'safeMutableDataEntries',
  'safeImmutableData',
  'safeMutableDataPermissionsSet',
  'safeMutableDataPermissions',
  'safeNfs'
];

// check SAFE API are available
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

/**
 * Save response URI to local storage
 * @param uri
 * @private
 */
const _saveResponseUri = (uri) => {
  if (typeof uri !== 'string') {
    throw new Error('URI is not a String');
  }
  window.localStorage.setItem(RES_URI_KEY, uri);
};

/**
 * Get response URI from local storage
 * @private
 */
const _getResponseUri = () => {
  return window.localStorage.getItem(RES_URI_KEY);
};

/**
 * Get file index data as buffer
 * @returns {Buffer}
 * @private
 */
const _getBufferedFileIndex = () => {
  if (typeof FILE_INDEX !== 'object') {
    throw new Error('FILE INDEX is not an Object');
  }
  return new Buffer(JSON.stringify(FILE_INDEX));
};

/**
 * Prepares an Array holding different versions of a file
 * @param oldData - existing file versions
 * @param newData - new version of file
 * @returns {Buffer} Array of file
 * @private
 */
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

/**
 * Connect to safe network with response URI from Authenticator
 * @param token
 * @param resUri
 * @private
 */
const _connectAuthorised = (token, resUri) => {
  return window.safeApp.connectAuthorised(token, resUri)
    .then((token) => (ACCESS_TOKEN = token));
};

/**
 * Check permission for granted access containers
 * @private
 */
const _fetchAccessInfo = () => {
  return window.safeApp.canAccessContainer(ACCESS_TOKEN, '_public')
    .then((hasAccess) => {
      if (!hasAccess) {
        throw new Error('Cannot access PUBLIC Container');
      }
      return true;
    });
};

/**
 * Creates the core mutable data (private) for the application.
 * This holds `FILE_INDEX` key which act as the index for files stored.
 * This mutable data has permission to - Insert, Update, Delete, ManagePermissions.
 * @private
 */
const _createMdata = () => {
  FILE_INDEX = {};
  return window.safeMutableData.newRandomPrivate(ACCESS_TOKEN, TYPE_TAG)
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
        .then(() => window.safeCrypto.getAppPubSignKey(ACCESS_TOKEN))
        .then((signKey) => (pubSignKeyHandle = signKey))
        .then(() => window.safeMutableData.newPermissions(ACCESS_TOKEN))
        .then((perm) => (permHandle = perm))
        .then(() => window.safeMutableDataPermissions.insertPermissionsSet(ACCESS_TOKEN, permHandle, pubSignKeyHandle, permSetHandle))
        .then(() => window.safeMutableData.newEntries(ACCESS_TOKEN))
        .then((entriesHandle) => window.safeMutableDataEntries.insert(ACCESS_TOKEN, entriesHandle, 'FILE_INDEX', _getBufferedFileIndex())
          .then(() => window.safeMutableData.put(ACCESS_TOKEN, mdata, permHandle, entriesHandle)))
        .then(() => window.safeMutableData.serialise(ACCESS_TOKEN, mdata));
    })
    .then((serialisedData) => {
      return window.safeApp.getContainer(ACCESS_TOKEN, '_public')
        .then((mdata) => window.safeMutableData.getEntries(ACCESS_TOKEN, mdata)
          .then((entries) => window.safeMutableDataEntries.mutate(ACCESS_TOKEN, entries)
            .then((mut) => window.safeMutableDataMutation.insert(ACCESS_TOKEN, mut, INDEX_FILE_NAME, serialisedData)
              .then(() => window.safeMutableData.applyEntriesMutation(ACCESS_TOKEN, mdata, mut)))));
    });
};

/**
 * Read file
 * @param mdata - handle of mutable data
 * @param filename
 * @private
 * @return {data, version} - data: file data, version: file entry version.
 */
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

/**
 * Update the file with new version
 * @param filename
 * @param payload
 * @private
 */
const _updateFile = (filename, payload) => {
  return window.safeApp.getContainer(ACCESS_TOKEN, '_public')
    .then((mdata) => window.safeMutableData.getEntries(ACCESS_TOKEN, mdata))
    .then((entries) => window.safeMutableDataEntries.get(ACCESS_TOKEN, entries, INDEX_FILE_NAME))
    .then((value) => window.safeMutableData.fromSerial(ACCESS_TOKEN, value.buf))
    .then((mdata) => {
      return _getFile(mdata, filename)
        .then((files) => window.safeMutableData.emulateAs(ACCESS_TOKEN, mdata, 'NFS')
          .then((nfs) => window.safeNfs.create(ACCESS_TOKEN, nfs, _prepareFile(files.data, payload))
            .then((file) => window.safeNfs.update(ACCESS_TOKEN, nfs, file, filename, parseInt(files.version, 10) + 1))));
    });
};

/**
 * Read file latest version
 * @param filename
 * @param version
 */
export const readFile = (filename, version) => {
  return window.safeApp.getContainer(ACCESS_TOKEN, '_public')
    .then((mdata) => window.safeMutableData.getEntries(ACCESS_TOKEN, mdata))
    .then((entries) => window.safeMutableDataEntries.get(ACCESS_TOKEN, entries, INDEX_FILE_NAME)
      .then((value) => window.safeMutableData.fromSerial(ACCESS_TOKEN, value.buf)
        .then((mdata) => _getFile(mdata, filename))
        .then((file) => {
          return version ? file.data[version] : file.data
        })));
};

/**
 * Save new file or update existing file with new version.
 * @param filename
 * @param data
 */
export const saveFile = (filename, data) => {
  if (FILE_INDEX[filename]) {
    // this was an edit, add new version
    console.log("existing");
    return _updateFile(filename, data);
  } else {
    return window.safeApp.getContainer(ACCESS_TOKEN, '_public')
      .then((publicMdHandle) => window.safeMutableData.getEntries(ACCESS_TOKEN, publicMdHandle))
      .then((entHandle) => window.safeMutableDataEntries.get(ACCESS_TOKEN, entHandle, INDEX_FILE_NAME))
      .then((value) => window.safeMutableData.fromSerial(ACCESS_TOKEN, value.buf)
        .then((mdata) => window.safeMutableData.emulateAs(ACCESS_TOKEN, mdata, 'NFS')
          .then((nfs) => window.safeNfs.create(ACCESS_TOKEN, nfs, _prepareFile([], data))
            .then((file) => window.safeNfs.insert(ACCESS_TOKEN, nfs, file, filename)))
          .then(() => window.safeMutableData.getEntries(ACCESS_TOKEN, mdata)
            .then((entriesHandle) => window.safeMutableData.encryptKey(ACCESS_TOKEN, mdata, 'FILE_INDEX')
              .then((key) => window.safeMutableData.get(ACCESS_TOKEN, mdata, key))
              .then((val) => window.safeMutableDataEntries.mutate(ACCESS_TOKEN, entriesHandle)
                .then((mut) => {
                  FILE_INDEX[filename] = 1;
                  return window.safeMutableDataMutation.update(ACCESS_TOKEN, mut, 'FILE_INDEX', _getBufferedFileIndex(), (parseInt(val.version, 10) + 1))
                    .then(() => window.safeMutableData.applyEntriesMutation(ACCESS_TOKEN, mdata, mut));
                }))))));
  }
};

/**
 * Get all versions of a file
 * @param filename
 */
export const getFileVersions = (filename) => {
  return readFile(filename);
};

/**
 * Get index of files or create the core mutable data
 * @return {Promise.<T>}
 */
export const getFileIndex = () => {
  if (FILE_INDEX) return Promise.resolve(FILE_INDEX);

  return window.safeApp.getContainer(ACCESS_TOKEN, '_public')
    .then((mdata) => window.safeMutableData.getEntries(ACCESS_TOKEN, mdata))
    .then((entries) => window.safeMutableDataEntries.get(ACCESS_TOKEN, entries, INDEX_FILE_NAME))
    .then((value) => window.safeMutableData.fromSerial(ACCESS_TOKEN, value.buf)
      .then((mdata) => window.safeMutableData.encryptKey(ACCESS_TOKEN, mdata, 'FILE_INDEX')
        .then((key) => window.safeMutableData.get(ACCESS_TOKEN, mdata, key)))
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

/**
 * Authorise with Authenticator.
 * Already authorised get the response URI from local storage and connect with SAFE Network.
 * @return {Promise.<T>}
 */
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
