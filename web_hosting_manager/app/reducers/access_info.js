// @flow

import ACTION_TYPES from '../actions/actionTypes';
import { I18n } from 'react-redux-i18n';
import { parseErrorMsg } from '../utils/app_utils';
import CONSTANTS from '../constants';

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
      console.log('fetch Error', action.payload);
      let errorMsg = (action.payload.code === CONSTANTS.ERROR_CODE.ENCODE_DECODE_ERROR) ?
        I18n.t('label.initialising.revoked') : parseErrorMsg(action.payload);
      state = {
        ...state,
        fetchingAccessInfo: false,
        error: I18n.t('messages.fetchingAccessFailed', { error: errorMsg })
      };
      break;
  }
  return state;
};

export default accessInfo;
