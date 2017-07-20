// @flow

import ACTION_TYPES from '../actions/actionTypes';
import { I18n } from 'react-redux-i18n';
import { parseErrorMsg, MD_TARGET } from '../utils/app_utils';

const initialState = {
  fetchingServices: false,
  fetchedServices: false,
  creatingService: false,
  remapping: false,
  error: null
};

const service = (state: Object = initialState, action: Object) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      state = {
        ...state,
        ...initialState
      };
      break;

    case `${ACTION_TYPES.FETCH_SERVICES}_PENDING`:
      state = {
        ...state,
        fetchingServices: true
      };
      break;

    case `${ACTION_TYPES.FETCH_SERVICES}_FULFILLED`:
      state = {
        ...state,
        fetchingServices: false,
        fetchedServices: true,
        services: action.payload
      };
      break;

    case `${ACTION_TYPES.FETCH_SERVICES}_REJECTED`:
      state = {
        ...state,
        fetchingServices: false,
        error: I18n.t('messages.fetchingServicesFailed', { error: parseErrorMsg(action.payload, MD_TARGET.PUBLIC_ID) })
      };
      break;

    case `${ACTION_TYPES.CREATE_SERVICE}_PENDING`:
      state = {
        ...state,
        creatingService: true,
        error: ''
      };
      break;

    case `${ACTION_TYPES.CREATE_SERVICE}_FULFILLED`:
      state = {
        ...state,
        creatingService: false,
      };
      break;

    case `${ACTION_TYPES.CREATE_SERVICE}_REJECTED`:
      state = {
        ...state,
        creatingService: false,
        error: parseErrorMsg(action.payload, MD_TARGET.PUBLIC_ID)
      };
      break;

    case `${ACTION_TYPES.CREATE_CONTAINER_AND_SERVICE}_PENDING`:
      state = {
        ...state,
        creatingService: true,
        error: ''
      };
      break;

    case `${ACTION_TYPES.CREATE_CONTAINER_AND_SERVICE}_FULFILLED`:
      state = {
        ...state,
        creatingService: false,
        error: ''
      };
      break;

    case `${ACTION_TYPES.CREATE_CONTAINER_AND_SERVICE}_REJECTED`:
      state = {
        ...state,
        creatingService: false,
        error: parseErrorMsg(action.payload, MD_TARGET.PUBLIC_ID)
      };
      break;

    case `${ACTION_TYPES.REMAP_SERVICE}_PENDING`:
      state = {
        ...state,
        remapping: true,
        error: ''
      };
      break;

    case `${ACTION_TYPES.REMAP_SERVICE}_FULFILLED`:
      state = {
        ...state,
        remapping: false,
        error: ''
      };
      break;

    case `${ACTION_TYPES.REMAP_SERVICE}_REJECTED`:
      state = {
        ...state,
        remapping: false,
        error: parseErrorMsg(action.payload, MD_TARGET.PUBLIC_ID)
      };
      break;
    case ACTION_TYPES.CLEAR_NOTIFICATION:
      state = {
        ...state,
        error: undefined,
        remapping: false
      };
      break;
  }
  return state;
};

export default service;
