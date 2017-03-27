// @flow

import * as Action from '../actions/app';
import { I18n } from 'react-redux-i18n';

const initialState = {
  fetchingServices: false,
  fetchedServices: false,
  creatingService: false,
  remapping: false,
  error: null
};

const service = (state: Object = initialState, action: Object) => {
  switch (action.type) {
    case Action.RESET:
      state = {
        ...state,
        ...initialState
      };
      break;

    case `${Action.FETCH_SERVICES}_PENDING`:
      state = {
        ...state,
        fetchingServices: true
      };
      break;

    case `${Action.FETCH_SERVICES}_FULFILLED`:
      state = {
        ...state,
        fetchingServices: false,
        fetchedServices: true,
        services: action.payload
      };
      break;

    case `${Action.FETCH_SERVICES}_REJECTED`:
      state = {
        ...state,
        fetchingServices: false,
        error: I18n.t('messages.fetchingServicesFailed', { error: action.payload.message })
      };
      break;

    case `${Action.CREATE_SERVICE}_PENDING`:
      state = {
        ...state,
        creatingService: true,
        error: ''
      };
      break;

    case `${Action.CREATE_SERVICE}_FULFILLED`:
      state = {
        ...state,
        creatingService: false,
      };
      break;

    case `${Action.CREATE_SERVICE}_REJECTED`:
      state = {
        ...state,
        creatingService: false,
        error: action.payload.message
      };
      break;

    case `${Action.CREATE_CONTAINER_AND_SERVICE}_PENDING`:
      state = {
        ...state,
        creatingService: true,
        error: ''
      };
      break;

    case `${Action.CREATE_CONTAINER_AND_SERVICE}_FULFILLED`:
      state = {
        ...state,
        creatingService: false,
        error: ''
      };
      break;

    case `${Action.CREATE_CONTAINER_AND_SERVICE}_REJECTED`:
      state = {
        ...state,
        creatingService: false,
        error: action.payload.message
      };
      break;

    case `${Action.REMAP_SERVICE}_PENDING`:
      state = {
        ...state,
        remapping: true,
        error: ''
      };
      break;

    case `${Action.REMAP_SERVICE}_FULFILLED`:
      state = {
        ...state,
        remapping: false,
        error: ''
      };
      break;

    case `${Action.REMAP_SERVICE}_REJECTED`:
      state = {
        ...state,
        remapping: false,
        error: action.payload.message
      };
      break;
  }
  return state;
};

export default service;
