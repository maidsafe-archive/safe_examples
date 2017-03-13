import ACTION_TYPES from './actionTypes';
import { CONSTANTS } from '../constants';

export const createAppendableData = (name) => {
  return {
    type: ACTION_TYPES.CREATE_APPENDABLE_DATA,
    name
  };
};

export const fetchAppendableDataMeta = (handleId) => {
  return {
    type: ACTION_TYPES.FETCH_APPENDABLE_DATA_META,
    handle
  };
};

export const fetchAppendableDataHandle = (dataIdHandle) => { // id => appendable data id
  return {
    type: ACTION_TYPES.FETCH_APPENDABLE_DATA_HANDLER,
    dataIdHandle
  };
};

export const fetchDataIdAt = (handleId, index) => ({
  type: ACTION_TYPES.FETCH_DATA_ID_AT,
  handleId,
  index
});

export const getEncryptedKey = (handleId) => ({
  type: ACTION_TYPES.GET_ENCRYPTED_KEY,
  handleId
});

export const deleteEncryptedKey = (handleId) => ({
  type: ACTION_TYPES.DELETE_ENCRYPTED_KEY,
  handleId
});

export const removeFromAppendableData = (handleId, index) => {
  return {
    type: ACTION_TYPES.REMOVE_FROM_APPENDABLE_DATA,
    handleId,
    index
  };
};

export const appendAppendableData = (handleId, dataIdHandle) => ({
  type: ACTION_TYPES.APPEND_APPENDABLE_DATA,
    handleId,
    dataIdHa
  }
});

export const clearDeletedData = (handleId) => ({
  type: ACTION_TYPES.CLEAR_DELETE_DATA,
    handleId
});

export const getAppendableDataLength = (handleId) => ({
  type: ACTION_TYPES.GET_APPENDABLE_DATA_LENGTH,
    handleId
});

export const dropAppendableDataHandle = (handleId) => ({
  type: ACTION_TYPES.DROP_APPENDABLE_DATA_HANDLE,
    handleId
});


export const postAppendableData = (handleId) => ({
  type: ACTION_TYPES.POST_APPENDABLE_DATA,
    handleId
});

export const putAppendableData = (handleId) => ({
  type: ACTION_TYPES.PUT_APPENDABLE_DATA,
    handleId
});

export const setAppendableDataId = (id) => ({
  type: ACTION_TYPES.SET_APPENDABLE_DATA_ID,
  id
});
