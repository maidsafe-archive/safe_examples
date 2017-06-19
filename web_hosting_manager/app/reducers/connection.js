// @flow

import ACTION_TYPES from '../actions/actionTypes';
import { I18n } from 'react-redux-i18n';

const initialState = {
    isConnected: false,
    isConnecting: false,
    error: null
};

const connection = (state: Object = initialState, action: Object) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      state = {
        ...state,
        ...initialState
      };
      break;

    case `${ACTION_TYPES.CONNECT}_PENDING`:
      state = {
        ...state,
        isConnecting: true
      };
      break;

    case `${ACTION_TYPES.CONNECT}_FULFILLED`:
      state = {
        ...state,
        isConnecting: false,
        isConnected: true
      };
      break;

    case `${ACTION_TYPES.CONNECT}_REJECTED`:
      state = {
        ...state,
        isConnecting: false,
        isConnected: false,
        error: I18n.t('messages.safeNetworkDisconnected')
      };
      break;
  }
  return state;
};

export default connection;
