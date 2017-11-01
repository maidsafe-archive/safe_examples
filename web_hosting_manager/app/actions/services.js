/**
 * Action handling service name
 */
/* eslint-disable import/no-named-as-default-member, import/no-named-as-default */
import api from '../safenet_comm/api';
/* eslint-enable import/no-named-as-default-member, import/no-named-as-default */
import ACTION_TYPES from './action_types';
import { setPublicNames } from './public_names';

/**
 * Check service already exists
 * @param publicName
 * @param serviceName
 */
export const checkServiceExists = (publicName, serviceName) => (
  (dispatch) => {
    dispatch({
      type: ACTION_TYPES.CHECK_SERVICE_EXIST,
      payload: api.fetchServices()
        .then((list) => {
          if (!list) {
            return;
          }
          const pubMatch = list.filter(p => p.name === publicName);
          if (pubMatch.length !== 0) {
            if (!pubMatch[0] ||
              !pubMatch[0].services ||
              (pubMatch[0].services.filter(s => s.name === serviceName).length === 0)) {
              return;
            }
          }
          return true;
        }),
    });
  }
);

/**
 * Fetch all service registered by user
 * @return {function(*)}
 */
export const fetchServices = () => (
  (dispatch) => {
    dispatch({
      type: ACTION_TYPES.FETCH_SERVICES,
      payload: api.fetchPublicNames()
        .then(() => api.fetchServices())
        .then(publicNames => dispatch(setPublicNames(publicNames))),
    });
  }
);

/**
 * Delete a service
 * @param publicName
 * @param serviceName
 */
export const deleteService = (publicName, serviceName) => (
  (dispatch) => {
    dispatch({
      type: ACTION_TYPES.DELETE_SERVICE,
      payload: api.deleteService(publicName, serviceName)
        .then(() => dispatch(fetchServices())),
    });
  }
);

/**
 * Remap existing service to different service container
 * @param publicName
 * @param service
 * @param containerPath
 */
export const remapService = (publicName, service, containerPath) => (
  {
    type: ACTION_TYPES.REMAP_SERVICE,
    payload: api.remapService(publicName, service, containerPath)
      .then(() => api.fetchServices()),
  }
);
