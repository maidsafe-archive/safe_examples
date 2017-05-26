// @flow

import * as Action from '../actions/app';

const initialState = {
  uploading: false,
  uploadStatus: undefined,
  downloading: false,
  downloadProgress: 0,
  error: undefined
};

const file = (state: Object = initialState, action: Object) => {
  switch (action.type) {
    case Action.RESET:
      state = {
        ...state,
        ...initialState
      };
      break;

    case Action.UPLOAD_STARTED:
      state = {
        ...state,
        uploading: true,
        error: undefined
      };
      break;

    case Action.UPLOADING:
      state = {
        ...state,
        uploadStatus: action.payload
      };
      break;

    case Action.UPLOAD_COMPLETED:
      state = {
        ...state,
        uploading: false,
        uploadStatus: undefined
      };
      break;
    case Action.UPLOAD_FAILED:
      state = {
        ...state,
        uploading: false,
        uploadStatus: undefined,
        error: action.payload.message
      };
      break;
    case Action.DOWNLOAD_STARTED:
      state = {
        ...state,
        downloading: true,
        error: undefined
      };
      break;

    case Action.DOWNLOADING:
      state = {
        ...state,
        downloadProgress: action.payload
      };
      break;

    case Action.DOWNLOAD_COMPLETED:
      state = {
        ...state,
        downloading: false,
        downloadProgress: 0
      };
      break;
    case Action.DOWNLOAD_FAILED:
      state = {
        ...state,
        downloading: false,
        downloadProgress: 0,
        error: action.payload.message
      };
      break;
    case Action.CLEAR_NOTIFICATION:
      state = {
        ...state,
        error: undefined
      };
      break;
  }
  return state;
};

export default file;
