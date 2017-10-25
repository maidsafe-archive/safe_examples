// @flow

/**
 * Actions common to all the components
 */
import ACTION_TYPES from './action_types';
/* eslint-disable import/no-named-as-default-member, import/no-named-as-default */
import api from '../lib/api';
/* eslint-enable import/no-named-as-default-member, import/no-named-as-default */

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
