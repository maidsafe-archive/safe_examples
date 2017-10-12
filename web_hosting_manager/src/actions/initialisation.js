// @flow

import ACTION_TYPES from './action_types';
import api from '../lib/api';
import {
  setPublicNames,
  setServiceContainers
} from './public_names';

const nwStateCallback = (dispatch) => {
  return function (state) {
    dispatch({
      type: ACTION_TYPES.NW_STATUS_CHANGED,
      state
    });
  }
};

const connected = () => ({
  type: ACTION_TYPES.CONNECTED
});

const fetchedAccessInfo = () => ({
  type: ACTION_TYPES.FETCHED_ACCESS_INFO
});

const fetchedPublicNames = () => ({
  type: ACTION_TYPES.FETCHED_PUBLIC_NAMES
});

const fetchedPublicContainer = () => ({
  type: ACTION_TYPES.FETCHED_PUBLIC_CONTAINER
});

const fetchedServices = () => ({
  type: ACTION_TYPES.FETCHED_SERVICES
});

export const initialiseApp = () => {
  return (dispatch, getState) => {
    let state = getState();
    if (!(state.authorisation.authorised && state.authorisation.authRes)) {
      dispatch({
        type: `${ACTION_TYPES.INITIALISE_APP}_REJECTED`,
        error: new Error('Application not authorised.')
      });
      return;
    }
    return dispatch({
      type: ACTION_TYPES.INITIALISE_APP,
      payload: api.connect(state.authorisation.authRes, nwStateCallback(dispatch))
        .then(() => {
          dispatch(connected());
          // check access container permission
          return api.canAccessContainers();
        })
        .then(() => {
          dispatch(fetchedAccessInfo());
          // fetch public names
          return api.fetchPublicNames();
        })
        .then(() => {
          dispatch(fetchedPublicNames());
          // get _public container entires
          return api.getPublicContainerKeys();
        })
        .then((containers) => {
          dispatch(setServiceContainers(containers));
          dispatch(fetchedPublicContainer());
          // fetch services
          return api.fetchServices();
        })
        .then((publicNames) => {
          dispatch(setPublicNames(publicNames));
          dispatch(fetchedServices());
        })
    });
  };
};

export const reset = () => ({
  type: ACTION_TYPES.RESET_INITIALISATION
});
