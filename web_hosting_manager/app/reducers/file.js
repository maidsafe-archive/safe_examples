// @flow

import ACTION_TYPES from '../actions/actionTypes';

const initialState = {
  uploading: false,
  uploadStatus: undefined,
  downloading: false,
  downloadProgress: 0,
  error: undefined
};

const file = (state: Object = initialState, action: Object) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      state = {
        ...state,
        ...initialState
      };
      break;

    case ACTION_TYPES.UPLOAD_STARTED:
      state = {
        ...state,
        uploading: true,
        error: undefined
      };
      break;

    case ACTION_TYPES.UPLOADING:
      state = {
        ...state,
        uploadStatus: action.payload
      };
      break;

    case ACTION_TYPES.UPLOAD_COMPLETED:
      state = {
        ...state,
        uploading: false,
        uploadStatus: undefined
      };
      break;
    case ACTION_TYPES.UPLOAD_FAILED:
      state = {
        ...state,
        uploading: false,
        uploadStatus: undefined,
        error: action.payload.message
      };
      break;
    case ACTION_TYPES.DOWNLOAD_STARTED:
      state = {
        ...state,
        downloading: true,
        error: undefined
      };
      break;

    case ACTION_TYPES.DOWNLOADING:
      state = {
        ...state,
        downloadProgress: action.payload
      };
      break;

    case ACTION_TYPES.DOWNLOAD_COMPLETED:
      state = {
        ...state,
        downloading: false,
        downloadProgress: 0
      };
      break;
    case ACTION_TYPES.DOWNLOAD_FAILED:
      state = {
        ...state,
        downloading: false,
        downloadProgress: 0,
        error: action.payload.message
      };
      break;
    case ACTION_TYPES.CLEAR_NOTIFICATION:
      state = {
        ...state,
        error: undefined
      };
      break;
  }
  return state;
};

export default file;
