import ACTION_TYPES from './actionTypes';

export const getCipherOptsHandle = (encType, keyHandle='') => ({
  type: ACTION_TYPES.GET_CIPHER_OPTS_HANDLE,
  encType,
  keyHandle
});

export const deleteCipherOptsHandle = (handleId) => ({
  type: ACTION_TYPES.DELETE_CIPHER_OPTS_HANDLE,
  handleId
});
