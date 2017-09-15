// @flow

import ACTION_TYPES from './action_types';
import api from '../lib/api';
import CONSTANTS from '../constants';

let isUploadCancelled = false;
export const upload = (localPath, networkPath, done) => {
  isUploadCancelled = false;
  return (dispatch) => {
    let progressCallback = (status, isCompleted) => {
      if (isUploadCancelled) {
        progressCallback = null;
        return;
      }
      dispatch({
        type: isCompleted ? ACTION_TYPES.UPLOAD_COMPLETED : ACTION_TYPES.UPLOADING,
        payload: status
      });
      if (isCompleted) {
        dispatch(getContainerInfo(networkPath));
        if (done && typeof done === 'function') {
          done();
        }
      }
    };
    let errorCallback = (error) => {
      dispatch({
        type: ACTION_TYPES.UPLOAD_FAILED,
        payload: error
      });
    };
    dispatch({
      type: ACTION_TYPES.UPLOAD_STARTED
    });
    api.getServiceContainerMeta(networkPath)
      .then(() => {
        return api.fileUpload(localPath, networkPath, progressCallback, errorCallback);
      })
      .catch((err) => {
        if (err.code !== CONSTANTS.ERROR_CODE.NO_SUCH_ENTRY) {
          return errorCallback(err);
        }
        const metadata = networkPath.replace('_public/', '');
        api.createServiceContainer(networkPath, metadata)
          .then(() => {
            return api.fileUpload(localPath, networkPath, progressCallback, errorCallback)
          })
      })
  };
};


export const getContainerInfo = (path) => ({
  type: ACTION_TYPES.GET_CONTAINER_INFO,
  payload: api.getServiceContainer(path)
});


export const publish = (publicId, serviceName, serviceContainerPath) => ({
  type: ACTION_TYPES.PUBLISH,
  payload: api.getServiceContainerMeta(serviceContainerPath)
    .then((meta) => api.createService(publicId, serviceName, meta.name))
});

export const resetContainerInfo = () => ({
  type: ACTION_TYPES.RESET_CONTAINER_INFO
});

export const publishTemplate = (publicId, serviceName, containerPath, files) => {
  return (dispatch) => {
    let filesDone = 0;
    let uploadFile = null;
    const done = () => {
      filesDone += 1;
      console.log('file uploaded', files[filesDone]);
      if (filesDone < files.length) {
        uploadFile();
        return;
      }
      if (filesDone === files.length) {
        console.log('published', filesDone);
        dispatch(publish(publicId, serviceName, containerPath));
      }
    };

    uploadFile = () => {
      const fileToUpload = files[filesDone];
      console.log('uploading file', fileToUpload);
      dispatch(upload(fileToUpload, containerPath, done));
    };

    uploadFile();
  };
};

export const deleteFileOrDir = (containerPath, name) => {
  return (dispatch) => {
    dispatch({
      type: ACTION_TYPES.DELETE_FILE_OR_FOLDER,
      payload: api.deleteFileOrDir(`${containerPath}/${name}`)
        .then(() => dispatch(getContainerInfo(containerPath)))
    });
  };
};

const cancelUpload = () => {
  // set upload cancelled flag
  isUploadCancelled = true;
  api.cancelFileUpload();
  const err = new Error('Upload cancelled');
  return {
    type: ACTION_TYPES.UPLOAD_FAILED,
    payload: err
  };
};

export const cancelUploadAndReloadContainer = (networkPath: string) => {
  return (dispatch) => {
    dispatch(cancelUpload());
    dispatch(getContainerInfo(networkPath));
  };
};

export const downloadFile = (networkPath) => {
  return (dispatch) => {
    dispatch({
      type: ACTION_TYPES.DOWNLOAD_STARTED
    });
    api.fileDownload(networkPath, (err, status) => {
      if (err) {
        return dispatch({
          type: ACTION_TYPES.DOWNLOAD_FAILED,
          payload: err
        });
      }
      dispatch({
        type: status.completed ? ACTION_TYPES.DOWNLOAD_COMPLETED : ACTION_TYPES.DOWNLOADING,
        payload: status.progress
      });
    });
  };
};
