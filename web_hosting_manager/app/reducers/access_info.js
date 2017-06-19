// @flow

import ACTION_TYPES from '../actions/actionTypes';
import { I18n } from 'react-redux-i18n';
import { trimErrorMsg } from '../utils/app_utils';

const initialState = {
  fetchingAccessInfo: false,
  fetchedAccessInfo: false,
  error: null
};

const accessInfo = (state: Object = initialState, action: Object) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      state = {
        ...state,
        ...initialState
      };
      break;

    case `${ACTION_TYPES.FETCH_ACCESS_INFO}_PENDING`:
      state = {
        ...state,
        fetchingAccessInfo: true
      };
      break;

    case `${ACTION_TYPES.FETCH_ACCESS_INFO}_FULFILLED`:
      state = {
        ...state,
        fetchingAccessInfo: false,
        fetchedAccessInfo: true
      };
      break;

    case `${ACTION_TYPES.FETCH_ACCESS_INFO}_REJECTED`:
      state = {
        ...state,
        fetchingAccessInfo: false,
        error: I18n.t('messages.fetchingAccessFailed', { error: trimErrorMsg(action.payload.message) })
      };
      break;
  }
  return state;
};

export default accessInfo;
