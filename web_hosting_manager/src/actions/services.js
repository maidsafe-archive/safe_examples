// @flow

import api from '../lib/api';
import ACTION_TYPES from './action_types';

import { setPublicNames } from './public_names';

// check service exists
export const checkServiceExists = (publicName, serviceName) => {
  return (dispatch) => {
    dispatch({
      type: ACTION_TYPES.CHECK_SERVICE_EXIST,
      payload: api.fetchServices()
        .then((list) => {
          if (!list || !list[publicName] || !list[publicName][serviceName]) {
            return;
          }
          return true;
        })
    })
  };
};

// fetch all the services
export const fetchServices = () => {
  return (dispatch) => {
    dispatch({
      type: ACTION_TYPES.FETCH_SERVICES,
      payload: api.fetchPublicNames()
        .then(() => api.fetchServices())
        .then((publicNames) => dispatch(setPublicNames(publicNames)))
    });
  };
};

export const deleteService = (publicName, serviceName) => {
  return (dispatch) => {
    dispatch({
      type: ACTION_TYPES.DELETE_SERVICE,
      payload: api.deleteService(publicName, serviceName)
        .then(() => dispatch(fetchServices()))
    })
  };
};

// cancel MD Request popup
export const cancelMDReq = () => ({
  type: ACTION_TYPES.CANCEL_MD_REQ
});

// send MD auth request
export const sendMDAuthReq = (publicName) => {
  return (dispatch) => {
    dispatch({
      type: ACTION_TYPES.SEND_MD_REQ
    });
    api.authoriseMD(publicName);
  }
};

export const remapService = (publicName, service, containerPath) => {
  return {
    type: ACTION_TYPES.REMAP_SERVICE,
    payload: api.remapService(publicName, service, containerPath)
      .then(() => api.fetchServices())
  };
};

