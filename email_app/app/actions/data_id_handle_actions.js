import ACTION_TYPES from './actionTypes';
import * as base64 from 'urlsafe-base64';

export const getStructuredDataIdHandle = (name, typeTag) => ({
  type: ACTION_TYPES.GET_STRUCTURED_DATA_ID_HANDLE,
  typeTag,
  name
});

export const getAppendableDataIdHandle = (name) => ({
  type: ACTION_TYPES.GET_STRUCTURED_DATA_ID_HANDLE,
  isPrivate: true,
  name
});

export const serialiseDataId = (handleId) => ({
  type: ACTION_TYPES.SERIALISE_DATA_ID,
  handleId
});

export const deserialiseDataId = (data) => ({
  type: ACTION_TYPES.DESERIALISE_DATA_ID,
  data
});

export const dropHandler = (handleId) => ({
  type: ACTION_TYPES.DROP_HANDLER,
  handleId
});
