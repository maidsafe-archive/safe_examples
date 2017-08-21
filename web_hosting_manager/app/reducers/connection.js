// @flow

import ACTION_TYPES from '../actions/actionTypes';
import { I18n } from 'react-redux-i18n';
import CONSTANTS from '../constants';

const initialState = {
  isConnected: false,
  isConnecting: false,
  reconnecting: false,
  networkState: null,
  error: null,
  logPath: null
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
        isConnected: true,
        logPath: action.payload
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
    case `${ACTION_TYPES.RECONNECT}_PENDING`:
      state = {
        ...state,
        reconnecting: true,
        networkState: CONSTANTS.NETWORK_STATE.INIT
      };
      break;
    case `${ACTION_TYPES.RECONNECT}_FULFILLED`:
      state = {
        ...state,
        reconnecting: false,
        isConnected: true,
      };
      break;

    case `${ACTION_TYPES.RECONNECT}_REJECTED`:
      state = {
        ...state,
        reconnecting: false,
        isConnected: false,
        error: I18n.t('messages.safeNetworkDisconnected')
      };
      break;

    case ACTION_TYPES.NET_STATUS_CHANGED:
      state = {
        ...state,
        networkState: action.state,
        reconnecting: false,
      };
      break;
  }
  return state;
};

export default connection;
