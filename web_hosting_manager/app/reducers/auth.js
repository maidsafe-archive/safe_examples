// @flow

import * as Action from '../actions/app';
import { I18n } from 'react-redux-i18n';

const initialState = {
    isAuthorised: false,
    isAuthorising: false,
    error: null
};

const auth = (state: Object = initialState, action: Object) => {
  switch (action.type) {
    case Action.RESET:
      state = {
        ...state,
        ...initialState
      };
      break;

    case Action.AUTH_REQUEST_SENT:
      state = {
        ...state,
        isAuthorising: true
      };
      break;

    case Action.AUTH_REQUEST_SEND_FAILED:
      state = {
        ...state,
        isAuthorising: false,
        error: I18n.t('messages.authReqError')
      };
      break;

    case Action.ON_AUTH_SUCCESS:
      state = {
        ...state,
        isAuthorising: false,
        isAuthorised: true
      };
      break;

    case Action.ON_AUTH_FAILURE:
      state = {
        ...state,
        isAuthorising: false,
        error: action.payload.message || I18n.t('messages.authorisationFailed')
      };
      break;
  }
  return state;
};

export default auth;
