// @flow

/**
 * Actions handling Public Names
 */
/* eslint-disable import/no-named-as-default-member, import/no-named-as-default */
import api from '../lib/api';
/* eslint-enable import/no-named-as-default-member, import/no-named-as-default */
import ACTION_TYPES from './action_types';

/**
 * check can access service container
 * @param publicName
 */
export const canAccessPublicName = publicName => ({
  type: ACTION_TYPES.CAN_ACCESS_PUBLIC_NAME,
  payload: api.canAccessServiceContainer(publicName),
});

/**
 * Set Public names to application state
 * @param publicNames
 */
export const setPublicNames = publicNames => ({
  type: ACTION_TYPES.SET_PUBLIC_NAMES,
  data: publicNames,
});

/**
 * Set service container details to application state
 * @param containers
 */
export const setServiceContainers = containers => ({
  type: ACTION_TYPES.SET_SERVICE_CONTAINERS,
  data: containers,
});

/**
 * Create new Public Name
 * @param publicName
 */
export const createPublicName = publicName => (
  (dispatch) => {
    dispatch({
      type: ACTION_TYPES.CREATE_PUBLIC_NAME,
      payload: api.createPublicName(publicName)
        .then(() => api.fetchPublicNames())
        .then(publicNames => dispatch(setPublicNames(publicNames))),
    });
  }
);

/**
 * Get all available service containers
 */
export const getServiceContainers = () => (
  (dispatch) => {
    dispatch({
      type: ACTION_TYPES.FETCH_SERVICE_CONTAINERS,
      payload: api.getServiceFolderNames()
        .then(containers => dispatch(setServiceContainers(containers))),
    });
  }
);
