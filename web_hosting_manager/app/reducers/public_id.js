// @flow

import * as Action from '../actions/app';
import { I18n } from 'react-redux-i18n';
import { trimErrorMsg } from '../utils/app_utils';

const initialState = {
  fetchingPublicNames: false,
  fetchedPublicNames: false,
  publicNames: {},
  creatingPublicId: false,
  error: null
};

const publicId = (state: Object = initialState, action: Object) => {
  switch (action.type) {
    case Action.RESET:
      state = {
        ...state,
        ...initialState
      };
      break;

    case `${Action.FETCH_PUBLIC_NAMES}_PENDING`:
      state = {
        ...state,
        publicNames: {},
        fetchingPublicNames: true
      };
      break;

    case `${Action.FETCH_PUBLIC_NAMES}_FULFILLED`:
    {
      const publicNames = {};
      let pkey = null;
      for (pkey of Object.keys(action.payload)) {
        publicNames[pkey] = { ...action.payload[pkey] };
      }
      state = {
        ...state,
        fetchingPublicNames: false,
        fetchedPublicNames: true,
        publicNames
      };
    }
      break;

    case `${Action.FETCH_PUBLIC_NAMES}_REJECTED`:
      state = {
        ...state,
        fetchingPublicNames: false,
        publicNames: {},
        error: I18n.t('messages.fetchingPublicNamesFailed', { error: trimErrorMsg(action.payload.message) })
      };
      break;

    case `${Action.CREATE_PUBLIC_ID}_PENDING`:
      state = {
        ...state,
        creatingPublicId: true
      };
      break;

    case `${Action.CREATE_PUBLIC_ID}_FULFILLED`:
    {
      const publicNames = {};
      let pkey = null;
      for (pkey of Object.keys(action.payload)) {
        publicNames[pkey] = { ...action.payload[pkey] };
      }
      state = {
        ...state,
        creatingPublicId: false,
        publicNames,
        error: ''
      };
    }
      break;

    case `${Action.CREATE_PUBLIC_ID}_REJECTED`:
      state = {
        ...state,
        creatingPublicId: false,
        error: trimErrorMsg(action.payload.message)
      };
      break;

    case `${Action.DELETE_SERVICE}_FULFILLED`:
    {
      const publicNames = {};
      let pkey = null;
      for (pkey of Object.keys(action.payload)) {
        publicNames[pkey] = { ...action.payload[pkey] };
      }
      state = {
        ...state,
        publicNames
      };
    }
      break;

    case `${Action.CREATE_CONTAINER_AND_SERVICE}_FULFILLED`:
    {
      const publicNames = {};
      let pkey = null;
      for (pkey of Object.keys(action.payload)) {
        publicNames[pkey] = { ...action.payload[pkey] };
      }
      state = {
        ...state,
        publicNames
      };
    }
      break;

    case `${Action.FETCH_SERVICES}_FULFILLED`:
    {
      const publicNames = {};
      let pkey = null;
      for (pkey of Object.keys(action.payload)) {
        publicNames[pkey] = { ...action.payload[pkey] };
      }
      state = {
        ...state,
        publicNames
      };
    }
      break;

    case `${Action.REMAP_SERVICE}_FULFILLED`:
      const publicNames = {};
      let pkey = null;
      for (pkey of Object.keys(action.payload)) {
        publicNames[pkey] = { ...action.payload[pkey] };
      }
      state = {
        ...state,
        publicNames
      };
      break;
  }
  return state;
};

export default publicId;
