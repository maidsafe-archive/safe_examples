// @flow

import { CONNECT, RESET } from '../actions/app';
import { I18n } from 'react-redux-i18n';

const initialState = {
    isConnected: false,
    isConnecting: false,
    error: null
};

const connection = (state: Object = initialState, action: Object) => {
  switch (action.type) {
    case RESET:
      state = {
        ...state,
        ...initialState
      };
      break;

    case `${CONNECT}_PENDING`:
      state = {
        ...state,
        isConnecting: true
      };
      break;

    case `${CONNECT}_FULFILLED`:
      state = {
        ...state,
        isConnecting: false,
        isConnected: true
      };
      break;

    case `${CONNECT}_REJECTED`:
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
