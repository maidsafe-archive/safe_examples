// @flow

/**
 * Actions related to file management
 */
import ACTION_TYPES from './action_types';
/* eslint-disable import/no-named-as-default-member, import/no-named-as-default */
import api from '../lib/api';
/* eslint-enable import/no-named-as-default-member, import/no-named-as-default */
import { canAccessPublicName } from './public_names';
import CONSTANTS from '../constants';

let isUploadCancelled = false;

/**
 * Get names of file and directory within the given container
 * @param path - container path
 */
export const getContainerInfo = path => ({
  type: ACTION_TYPES.GET_CONTAINER_INFO,
  payload: api.fetchFiles(path),
});

/**
 * Cancel file upload
 * @return {{type: string, payload: Error}}
 */
const cancelUpload = () => {
  // set upload cancelled flag
  isUploadCancelled = true;
  api.cancelFileUpload();
  const err = new Error('Upload cancelled');
  return {
    type: ACTION_TYPES.UPLOAD_FAILED,
    payload: err,
  };
};

/**
 * Upload file or directory
 * - create service container if not exists
 * - upload files within the service container
 * @param {string} localPath - system path
 * @param {string} networkPath - path on SAFE Network
 * @param {function} done - callback function called when upload completed.
 */
export const upload = (localPath, networkPath, done) => {
  isUploadCancelled = false;
  return (dispatch) => {
    let progressCallback = (status, isCompleted) => {
      console.log('upload progress ::', status, isCompleted);
      if (isUploadCancelled) {
        progressCallback = null;
        return;
      }
      dispatch({
        type: isCompleted ? ACTION_TYPES.UPLOAD_COMPLETED : ACTION_TYPES.UPLOADING,
        payload: status,
      });
      if (isCompleted) {
        dispatch(getContainerInfo(networkPath));
        if (done && typeof done === 'function') {
          done();
        }
      }
    };
    const errorCallback = error => (
      dispatch({
        type: ACTION_TYPES.UPLOAD_FAILED,
        payload: error,
      })
    );
    dispatch({
      type: ACTION_TYPES.UPLOAD_STARTED,
    });
    api.getServiceFolderInfo(networkPath)
      .then(() => api.fileUpload(localPath, networkPath, progressCallback, errorCallback))
      .catch((err) => {
        if (err.code !== CONSTANTS.ERROR_CODE.NO_SUCH_ENTRY) {
          return errorCallback(err);
        }
        const metadata = networkPath.replace('_public/', '');
        api.createServiceFolder(networkPath, metadata)
          .then(() => api.fileUpload(localPath, networkPath, progressCallback, errorCallback));
      });
  };
};

/**
 * Publish a service
 * - called after uploading files within service container
 * @param publicId
 * @param serviceName
 * @param serviceContainerPath
 */
export const publish = (publicId, serviceName, serviceContainerPath) => ({
  type: ACTION_TYPES.PUBLISH,
  payload: api.getServiceFolderInfo(serviceContainerPath)
    .then(meta => api.createService(publicId, serviceName, meta.name)),
});

/**
 * Reset container Info - clears the value on state object
 */
export const resetContainerInfo = () => ({
  type: ACTION_TYPES.RESET_CONTAINER_INFO,
});

/**
 * Publish template
 * - upload template files to service container
 * - publish the service once uploaded.
 * @param publicId
 * @param serviceName
 * @param containerPath
 * @param files - array of files to upload on network
 */
export const publishTemplate = (publicId, serviceName, containerPath, files) => (
  (dispatch) => {
    dispatch({ type: ACTION_TYPES.UPLOADING_TEMPLATE });
    let filesDone = 0;
    let uploadFile = null;
    const done = () => {
      filesDone += 1;
      if (filesDone < files.length) {
        uploadFile();
        return;
      }
      if (filesDone === files.length) {
        dispatch({ type: ACTION_TYPES.UPLOADED_TEMPLATE });
        dispatch(publish(publicId, serviceName, containerPath));
      }
    };

    uploadFile = () => {
      const fileToUpload = files[filesDone];
      dispatch(upload(fileToUpload, containerPath, done));
    };

    uploadFile();
  }
);

/**
 * Delete file or directory
 * @param containerPath - folder hosting the file/directory
 * @param name - name of file/directory to delete
 */
export const deleteFileOrDir = (containerPath, name) => (
  (dispatch) => {
    dispatch({
      type: ACTION_TYPES.DELETE_FILE_OR_FOLDER,
      payload: api.deleteFileOrDir(`${containerPath}/${name}`)
        .then(() => dispatch(getContainerInfo(containerPath))),
    });
  }
);

/**
 * Cancel upload and fetch container
 * @param networkPath
 */
export const cancelUploadAndReloadContainer = networkPath => (
  (dispatch) => {
    dispatch(cancelUpload());
    dispatch(getContainerInfo(networkPath));
  }
);

/**
 * Download file from network
 * @param networkPath
 */
export const downloadFile = networkPath => (
  (dispatch) => {
    dispatch({
      type: ACTION_TYPES.DOWNLOAD_STARTED,
    });
    api.fileDownload(networkPath, (err, status) => {
      if (err) {
        return dispatch({
          type: ACTION_TYPES.DOWNLOAD_FAILED,
          payload: err,
        });
      }
      dispatch({
        type: status.completed ? ACTION_TYPES.DOWNLOAD_COMPLETED : ACTION_TYPES.DOWNLOADING,
        payload: status.progress,
      });
    });
  }
);

/**
 * Cancel file download
 * @return {{type: string, payload: Error}}
 */
export const cancelDownload = () => {
  api.cancelFileDownload();
  const err = new Error('Download canceled');
  return {
    type: ACTION_TYPES.DOWNLOAD_FAILED,
    payload: err,
  };
};

/**
 * check for service container access and fetch its data
 * @param publicName
 * @param path
 */
export const checkAndFetchContainer = (publicName, path) => (
  (dispatch) => {
    const canAccessPublicNameAction = canAccessPublicName(publicName);
    dispatch({
      type: canAccessPublicNameAction.type,
      payload: canAccessPublicNameAction.payload.then(() => dispatch(getContainerInfo(path))),
    });
  }
);
