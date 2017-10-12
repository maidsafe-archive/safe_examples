// @flow

import ACTION_TYPES from './action_types';
import api from '../lib/api';

export const reset = () => ({
  type: ACTION_TYPES.RESET
});

export const reconnect = () => {
  return {
    type: ACTION_TYPES.RECONNECT,
    payload: api.reconnect()
  }
};
