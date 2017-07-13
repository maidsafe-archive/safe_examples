// @flow

import ACTION_TYPES from '../actions/actionTypes';
import { I18n } from 'react-redux-i18n';

const initialState = {
    isAuthorised: false,
    isAuthorising: false,
    error: null,
    isRevoked: false
};

const auth = (state: Object = initialState, action: Object) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      state = {
        ...state,
        ...initialState
      };
      break;

    case ACTION_TYPES.AUTH_REQUEST_SENT:
      state = {
        ...state,
        isAuthorising: true,
        isRevoked: false
      };
      break;

    case ACTION_TYPES.AUTH_REQUEST_SEND_FAILED:
      state = {
        ...state,
        isAuthorising: false,
        error: I18n.t('messages.authReqError')
      };
      break;

    case ACTION_TYPES.ON_AUTH_SUCCESS:
      state = {
        ...state,
        isAuthorising: false,
        isAuthorised: true
      };
      break;

    case ACTION_TYPES.ON_AUTH_FAILURE:
      state = {
        ...state,
        isAuthorising: false,
        error: action.payload.message || I18n.t('messages.authorisationFailed')
      };
      break;
    case ACTION_TYPES.REVOKED:
      state = {
        ...state,
        isRevoked: true
      }
      break;
  }
  return state;
};

export default auth;
