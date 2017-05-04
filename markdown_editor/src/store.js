/* global btoa, safeAuth, safeNFS safeCipherOpts, safeStructuredData, safeDataId */
import { APP_INFO, APP_INFO_OPTS, CONTAINERS } from './config.js';

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

const RES_URI_KEY = 'SAFE_RES_URI';
const FILE_INDEX_KEY = 'FILE_INDEX';

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
  return window.safeApp.getHomeContainer(ACCESS_TOKEN)
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
  return window.safeApp.getHomeContainer(ACCESS_TOKEN)
    .then((mdata) => _getFile(mdata, filename))
    .then((file) => {
      return version ? file.data[version] : file.data
    });
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
    return window.safeApp.getHomeContainer(ACCESS_TOKEN)
      .then((mdata) => window.safeMutableData.emulateAs(ACCESS_TOKEN, mdata, 'NFS')
        .then((nfs) => window.safeNfs.create(ACCESS_TOKEN, nfs, _prepareFile([], data))
          .then((file) => window.safeNfs.insert(ACCESS_TOKEN, nfs, file, filename)))
        .then(() => window.safeMutableData.getEntries(ACCESS_TOKEN, mdata)
          .then((entriesHandle) => window.safeMutableData.encryptKey(ACCESS_TOKEN, mdata, FILE_INDEX_KEY)
            .then((key) => window.safeMutableData.get(ACCESS_TOKEN, mdata, key))
            .then((val) => window.safeMutableDataEntries.mutate(ACCESS_TOKEN, entriesHandle)
              .then((mut) => {
                FILE_INDEX[filename] = 1;
                return window.safeMutableDataMutation.update(ACCESS_TOKEN, mut, FILE_INDEX_KEY, _getBufferedFileIndex(), (parseInt(val.version, 10) + 1))
                  .then(() => window.safeMutableData.applyEntriesMutation(ACCESS_TOKEN, mdata, mut));
              })))));
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
 * Get index of files or prepare home container
 * @return {Promise}
 */
export const getFileIndex = () => {
  if (FILE_INDEX) return Promise.resolve(FILE_INDEX);

  return window.safeApp.getHomeContainer(ACCESS_TOKEN)
    .then((mdata) => window.safeMutableData.encryptKey(ACCESS_TOKEN, mdata, FILE_INDEX_KEY)
      .then((key) => window.safeMutableData.get(ACCESS_TOKEN, mdata, key))
      .then((fileIndex) => {
        FILE_INDEX = JSON.parse(fileIndex.buf.toString());
        return FILE_INDEX;
      })
      .catch(() => {
        FILE_INDEX = {};
        console.warn('Preparing Home container');

        // FIXME: check for exact error condition.
        return window.safeMutableData.getEntries(ACCESS_TOKEN, mdata)
          .then((entriesHandle) => window.safeMutableDataEntries.mutate(ACCESS_TOKEN, entriesHandle))
          .then((mut) => window.safeMutableDataMutation.insert(ACCESS_TOKEN, mut, FILE_INDEX_KEY, _getBufferedFileIndex())
            .then(() => window.safeMutableData.applyEntriesMutation(ACCESS_TOKEN, mdata, mut)));
      }));
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
      return window.safeApp.authorise(token, CONTAINERS, APP_INFO_OPTS)
        .then((resUri) => {
          _saveResponseUri(resUri);
          return _connectAuthorised(token, resUri);
        });
    });
};
