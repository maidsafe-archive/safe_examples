// @flow

import api from '../lib/api';
import { I18n } from 'react-redux-i18n';
import ACTION_TYPES from './actionTypes';
import CONSTANTS from '../lib/constants';
import * as utils from '../lib/utils';

const sendAuthRequest = () => {
  const action = api.authorise() ? ACTION_TYPES.AUTH_REQUEST_SENT : ACTION_TYPES.AUTH_REQUEST_SEND_FAILED;
  return {
    type: action
  };
};

export const reset = () => {
  return {
    type: ACTION_TYPES.RESET
  };
};

export const revoked = () => {
  return {
    type: ACTION_TYPES.REVOKED
  };
};

export const connect = (authRes: String) => {
  if (!authRes && !utils.localAuthInfo.get()) {
    return sendAuthRequest();
  }
  return (dispatch) => {
    return dispatch({
      type: ACTION_TYPES.CONNECT,
      payload: api.connect(authRes)
    });
  };
};

export const onAuthSuccess = (authInfo: Object) => {
  return {
    type: ACTION_TYPES.ON_AUTH_SUCCESS
  };
};

export const onAuthFailure = (error: Object) => {
  return {
    type: ACTION_TYPES.ON_AUTH_FAILURE,
    payload: error
  };
};

export const getAccessInfo = () => {
  return {
    type: ACTION_TYPES.FETCH_ACCESS_INFO,
    payload: api.canAccessContainers()
  };
};

export const getPublicNames = () => {
  return {
    type: ACTION_TYPES.FETCH_PUBLIC_NAMES,
    payload: api.fetchPublicNames()
  };
};

export const createPublicId = (publicId: string) => {
  return {
    type: ACTION_TYPES.CREATE_PUBLIC_ID,
    payload: api.createPublicName(publicId)
      .then(() => {
        return api.fetchPublicNames(publicId);
      })
  };
};

export const createContainerAndService = (publicId: string, service: string,
                                          conatinerName: string, parentConatiner: string) => {
  const path = `${parentConatiner}/${publicId}/${conatinerName}`;
  return {
    type: ACTION_TYPES.CREATE_CONTAINER_AND_SERVICE,
    payload: api.updateServiceIfExist(publicId, service, path)
      .then((exist) => {
        if (!exist) {
          return api.createServiceContainer(path)
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
    type: ACTION_TYPES.CREATE_SERVICE,
    payload: api.getServiceContainerMeta(containerPath)
      .then((meta) => api.createService(publicId, service, meta.name))
      .then(() => api.fetchServices())
  };
};

export const deleteService = (publicId: string, service: string) => {
  return {
    type: ACTION_TYPES.DELETE_SERVICE,
    payload: api.deleteService(publicId, service)
      .then(() => api.fetchServices())
  };
};

export const getServices = () => {
  return {
    type: ACTION_TYPES.FETCH_SERVICES,
    payload: api.fetchServices()
  };
};

export const getPublicContainers = () => {
  return {
    type: ACTION_TYPES.FETCH_PUBLIC_CONTAINERS,
    payload: api.getPublicContainerKeys()
  };
};

export const remapService = (service: string, publicId: string, containerPath: string) => {
  return {
    type: ACTION_TYPES.REMAP_SERVICE,
    payload: api.remapService(publicId, service, containerPath)
      .then(() => api.fetchServices())
  };
};

export const getContainer = (containerPath: string) => {
  return {
    type: ACTION_TYPES.FETCH_CONTAINER,
    payload: api.getServiceContainer(containerPath)
  };
};

export const upload = (localPath: string, networkPath: string) => {
  return (dispatch) => {
    const progressCallback = (status, isCompleted) => {
      dispatch({
        type: isCompleted ? ACTION_TYPES.UPLOAD_COMPLETED : ACTION_TYPES.UPLOADING,
        payload: status
      });
      if (isCompleted) {
        dispatch(getContainer(networkPath));
      }
    };
    const errorCallback = (error) => {
      dispatch({
        type: ACTION_TYPES.UPLOAD_FAILED,
        payload: error
      });
    };
    api.fileUpload(localPath, networkPath, progressCallback, errorCallback);
    dispatch({
      type: ACTION_TYPES.UPLOAD_STARTED
    });
  };
};

export const cancelUpload = () => {
  api.cancelFileUpload();
  const err = new Error(I18n.t('messages.uploadCancelled'));
  return {
    type: ACTION_TYPES.UPLOAD_FAILED,
    payload: err
  };
};

export const download = (networkPath: string) => {
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

export const cancelDownload = () => {
  api.cancelFileDownload();
  const err = new Error(I18n.t('messages.downloadCancelled'));
  return {
    type: ACTION_TYPES.DOWNLOAD_FAILED,
    payload: err
  };
};

export const deleteItem = (containerPath, name) => {
  return {
    type: ACTION_TYPES.DELETE,
    payload: api.deleteFileOrDir(`${containerPath}/${name}`)
      .then(() => {
        return api.getServiceContainer(containerPath);
      })
  };
};

export const clearNotification = () => {
  return {
    type: ACTION_TYPES.CLEAR_NOTIFICATION
  }
};

export const clearAccessData = () => {
  utils.localAuthInfo.clear();
  return {
    type: ACTION_TYPES.CLEAR_ACCESS_DATA
  };
};
