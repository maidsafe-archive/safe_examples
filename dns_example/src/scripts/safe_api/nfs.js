/**
 * NFS API functions
 * Interacts with the Launcher IPC and performs the operations
*/
exports = module.exports = function(requestManager) {
  var log = require('npmlog');

  /**
   *
   * @param isSafeDrivePath - is the root of the path beigins from SAFEDrive, if false it will search in application root directory
   * @param path - path where the directory has to be created the last fragment or token will be the directory name
   * @param data - base64 string
   * @param callback
   */
  var UploadData = function(isSafeDrivePath, path, data, callback) {
    this.execute = function() {
      var request = {
        endpoint: 'safe-api/v1.0/nfs/modify-file',
        data: {
          is_path_shared: isSafeDrivePath,
          file_path: path,
          new_values: {
            name: null,
            content: {
              offset: 0,
              overwrite: true,
              bytes: data
            },
            user_metadata: null
          }
        }
      };
      log.verbose('Uploading content for file - ' +  path);
      requestManager.send(request, callback);
    };

    return this.execute;
  };

  /**
   *
   * @param isSafeDrivePath - is the root of the path begins from SAFEDrive, if false it will search in application root directory
   * @param path - path where the directory has to be created the last fragment or token will be the directory name
   * @param isPrivate - private or public shared directory
   * @param isVersioned - true if the directory has to be versioned
   * @param metadata - string that has to be associated as metadata with the directory
   * @param callback
   */
  this.createDir = function(isSafeDrivePath, path, isPrivate, isVersioned, metadata, callback) {
    var request = {
      endpoint: 'safe-api/v1.0/nfs/create-dir',
      data: {
        is_path_shared: isSafeDrivePath || false,
        dir_path: path || '/',
        is_private: isPrivate || false,
        is_versioned: isVersioned || false,
        user_metadata: new Buffer(metadata || '').toString('base64')
      }
    };
    log.verbose('Creating Directory :: ' +  path);
    requestManager.send(request, callback);
  };

  /**
   *
   * @param isSafeDrivePath - is the root of the path begins from SAFEDrive, if false it will search in application root directory
   * @param path - path where the directory has to be created the last fragment or token will be the directory name
   * @param metadata
   * @param data
   * @param callback
   */
  this.createFile = function(isSafeDrivePath, path, metadata, data, callback) {
    var request = {
      endpoint: 'safe-api/v1.0/nfs/create-file',
      data: {
        is_path_shared: isSafeDrivePath || false,
        file_path: path || '/',
        user_metadata: new Buffer(metadata || '').toString('base64')
      }
    };
    log.verbose('Creating File :: ' +  path);
    requestManager.send(request, data ? new UploadData(isSafeDrivePath, path, data, callback) : callback);
  };

  return this;
};
