// @flow

import * as Action from '../actions/app';
import { I18n } from 'react-redux-i18n';

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
        publicNames: [],
        fetchingPublicNames: true
      };
      break;

    case `${Action.FETCH_PUBLIC_NAMES}_FULFILLED`:
      state = {
        ...state,
        fetchingPublicNames: false,
        fetchedPublicNames: true,
        publicNames: action.payload
      };
      break;

    case `${Action.FETCH_PUBLIC_NAMES}_REJECTED`:
      state = {
        ...state,
        fetchingPublicNames: false,
        publicNames: {},
        error: I18n.t('messages.fetchingPublicNamesFailed', { error: action.payload.message })
      };
      break;

    case `${Action.CREATE_PUBLIC_ID}_PENDING`:
      state = {
        ...state,
        creatingPublicId: true
      };
      break;

    case `${Action.CREATE_PUBLIC_ID}_FULFILLED`:
      state = {
        ...state,
        creatingPublicId: false,
        publicNames: action.payload,
        error: ''
      };
      break;

    case `${Action.CREATE_PUBLIC_ID}_REJECTED`:
      state = {
        ...state,
        creatingPublicId: false,
        error: action.payload.message
      };
      break;

    case `${Action.REMAP_SERVICE}_FULFILLED`:
      state = {
        ...state,
        publicNames: action.payload
      };
      break;
  }
  return state;
};

export default publicId;
