import ACTION_TYPES from './actionTypes';
import { CONSTANTS } from '../constants';

export const createStructuredData = (name, data, cipherHandle) => ({
  type: ACTION_TYPES.CREATE_STRUCTURED_DATA,
  name,
  typeTag: CONSTANTS.TAG_TYPE.DEFAULT,
  cipherOpts: cipherHandle,
  data
  // data: new Buffer(JSON.stringify(data)).toString('base64')
});

export const fetchStructuredData = (handleId) => ({
  type: ACTION_TYPES.FETCH_STRUCTURED_DATA,
  handleId
});

export const fetchStructuredDataHandle = (dataIdHandle) => ({
  type: ACTION_TYPES.FETCH_STRUCTURE_DATA_HANDLE,
  dataIdHandle
});

export const fetchStructuredDataIdHandle = (handleId) => ({
  type: ACTION_TYPES.FETCH_STRUCTURE_DATA_ID_HANDLE,
  handleId
});

export const updateStructuredData = (handleId, data, cipherOpts) => ({
  type: ACTION_TYPES.UPDATE_STRUCTURED_DATA,
  handleId,
  cipherOpts,
  data
        // data: new Buffer(JSON.stringify(data)).toString('base64')
});

export const dropStructuredDataHandle = (handleId) => ({
  type: ACTION_TYPES.DROP_STRUCTURED_DATA_HANDLE,
  handleId
});

export const postStructuredData = (handleId) => ({
  type: ACTION_TYPES.POST_STRUCTURED_DATA,
  handleId
});

export const putStructuredData = (handleId) => ({
  type: ACTION_TYPES.PUT_STRUCTURED_DATA,
  handleId
});

