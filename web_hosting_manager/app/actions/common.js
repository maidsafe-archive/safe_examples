/**
 * Actions common to all the components
 */
/* eslint-disable import/no-named-as-default-member, import/no-named-as-default */
import api from '../safenet_comm/api';
/* eslint-enable import/no-named-as-default-member, import/no-named-as-default */
import ACTION_TYPES from './action_types';

/**
 * Reset to initial state
 */
export const reset = () => ({
  type: ACTION_TYPES.RESET,
});

/**
 * Reconnect app with Safe Network
 */
export const reconnect = () => ({
  type: ACTION_TYPES.RECONNECT_APP,
  payload: api.reconnect(),
});

export const getLogFilePath = () => ({
  type: ACTION_TYPES.GET_LOG_FILE_PATH,
  payload: api.getLogFilePath()
})
