// @flow

import * as api from '../lib/api';
import { I18n } from 'react-redux-i18n';

export const RESET = 'RESET';
export const AUTH_REQUEST_SENT = 'AUTH_REQUEST_SENT';
export const AUTH_REQUEST_SEND_FAILED = 'AUTH_REQUEST_SEND_FAILED';
export const CONNECT = 'CONNECT';
export const ON_AUTH_SUCCESS = 'ON_AUTH_SUCCESS';
export const ON_AUTH_FAILURE = 'ON_AUTH_FAILURE';

export const CREATE_PUBLIC_ID = 'CREATE_PUBLIC_ID';
export const CREATE_SERVICE = 'CREATE_SERVICE';
export const DELETE_SERVICE = 'DELETE_SERVICE';
export const REMAP_SERVICE = 'REMAP_SERVICE';
export const CREATE_CONTAINER_AND_SERVICE = 'CREATE_CONTAINER_AND_SERVICE';
export const FETCH_ACCESS_INFO = 'FETCH_ACCESS_INFO';
export const FETCH_PUBLIC_NAMES = 'FETCH_PUBLIC_NAMES';
export const FETCH_SERVICES = 'FETCH_SERVICES';
export const FETCH_PUBLIC_CONTAINERS = 'FETCH_PUBLIC_CONTAINERS';
export const FETCH_CONTAINER = 'FETCH_CONTAINER';

export const UPLOAD_STARTED = 'UPLOAD_STARTED';
export const UPLOADING = 'UPLOADING';
export const UPLOAD_FAILED = 'UPLOAD_FAILED';
export const UPLOAD_COMPLETED = 'UPLOAD_COMPLETED';

export const DOWNLOAD_STARTED = 'DOWNLOAD_STARTED';
export const DOWNLOADING = 'DOWNLOADING';
export const DOWNLOAD_FAILED = 'DOWNLOAD_FAILED';
export const DOWNLOAD_COMPLETED = 'DOWNLOAD_COMPLETED';
export const CLEAR_NOTIFICATION = 'CLEAR_NOTIFICATION';

export const DELETE = 'DELETE';

const sendAuthRequest = () => {
  const action = api.authorise() ? AUTH_REQUEST_SENT : AUTH_REQUEST_SEND_FAILED;
  return {
    type: action
  };
};

export const reset = () => {
  return {
    type: RESET
  };
};

export const connect = (forceTempValue: boolean) => {
  if (!forceTempValue && !api.hasLocalAuthInfo()) {
    return sendAuthRequest();
  }
  return {
    type: CONNECT,
    payload: api.connect()
  };
};

export const onAuthSuccess = (authInfo: Object) => {
  api.saveAuthInfo(authInfo);
  return {
    type: ON_AUTH_SUCCESS
  };
};

export const onAuthFailure = (error: Object) => {
  return {
    type: ON_AUTH_FAILURE,
    payload: error
  };
};

export const getAccessInfo = () => {
  return {
    type: FETCH_ACCESS_INFO,
    payload: api.fetchAccessInfo()
  };
};

export const getPublicNames = () => {
  return {
    type: FETCH_PUBLIC_NAMES,
    payload: api.fetchPublicNames()
  };
};

export const createPublicId = (publicId: string) => {
  return {
    type: CREATE_PUBLIC_ID,
    payload: api.createPublicId(publicId)
      .then(() => {
        return api.fetchPublicNames(publicId);
      })
  };
};

export const createContainerAndService = (publicId: string, service: string,
                                          conatinerName: string, parentConatiner: string) => {
  const path = `${parentConatiner}/${publicId}/${conatinerName}`;
  return {
    type: CREATE_CONTAINER_AND_SERVICE,
    payload: api.checkServiceExist(publicId, service, path)
      .then((exist) => {
        if (!exist) {
          return api.createContainer(path)
            .then((name) => {
              return api.createService(publicId, service, name);
            });
        }
        return Promise.resolve(true);
      })
      .then(() => api.fetchServices())
  };
};

export const createService = (publicId: string, service: string, containerPath: string) => {
  return {
    type: CREATE_SERVICE,
    payload: api.createService(publicId, service, containerPath)
  };
};

export const deleteService = (publicId: string, service: string) => {
  return {
    type: DELETE_SERVICE,
    payload: api.deleteService(publicId, service)
      .then(() => api.fetchServices())
  };
};

export const getServices = () => {
  return {
    type: FETCH_SERVICES,
    payload: api.fetchServices()
  };
};

export const getPublicContainers = () => {
  return {
    type: FETCH_PUBLIC_CONTAINERS,
    payload: api.getPublicContainers()
  };
};

export const remapService = (service: string, publicId: string, containerPath: string) => {
  return {
    type: REMAP_SERVICE,
    payload: api.remapService(service, publicId, containerPath)
      .then(() => api.fetchServices())
  };
};

export const getContainer = (containerPath: string) => {
  return {
    type: FETCH_CONTAINER,
    payload: api.getContainer(containerPath)
  };
};

export const upload = (localPath: string, networkPath: string) => {
  return (dispatch) => {
    const progressCallback = (status, isCompleted) => {
      dispatch({
        type: isCompleted ? UPLOAD_COMPLETED : UPLOADING,
        payload: status
      });
      if (isCompleted) {
        dispatch(getContainer(networkPath));
      }
    };
    const errorCallback = (error) => {
      dispatch({
        type: UPLOAD_FAILED,
        payload: error
      });
    };
    api.upload(localPath, networkPath, progressCallback, errorCallback);
    dispatch({
      type: UPLOAD_STARTED
    });
  };
};

export const cancelUpload = () => {
  api.cancelUpload();
  const err = new Error(I18n.t('messages.uploadCancelled'));
  return {
    type: UPLOAD_FAILED,
    payload: err
  };
};

export const download = (networkPath: string) => {
  return (dispatch) => {
    dispatch({
      type: DOWNLOAD_STARTED
    });
    api.download(networkPath, (err, status) => {
      if (err) {
        return dispatch({
          type: DOWNLOAD_FAILED,
          payload: err
        });
      }
      dispatch({
        type: status.completed ? DOWNLOAD_COMPLETED : DOWNLOADING,
        payload: status.progress
      });
    });
  };
};

export const cancelDownload = () => {
  api.cancelDownload();
  const err = new Error(I18n.t('messages.downloadCancelled'));
  return {
    type: DOWNLOAD_FAILED,
    payload: err
  };
};


export const deleteItem = (containerPath, name) => {
  return {
    type: DELETE,
    payload: api.deleteItem(`${containerPath}/${name}`)
      .then(() => {
        return api.getContainer(containerPath);
      })
  };
};

export const clearNotification = () => {
  return {
    type: CLEAR_NOTIFICATION
  }
};
