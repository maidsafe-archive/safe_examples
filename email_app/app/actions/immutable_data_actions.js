import ACTION_TYPES from './actionTypes';

export const createImmutableDataWriterHandle = () => ({
  type: ACTION_TYPES.CREATE_IMMUT_WRITER_HANDLE
});

export const getImmutableDataReadHandle = (handleId) => ({
  type: ACTION_TYPES.GET_IMMUT_READ_HANDLE,
  handleId
});

export const readImmutableData = (handleId) => ({
  type: ACTION_TYPES.READ_IMMUT_DATA,
  handleId
});

export const writeImmutableData = (handleId, data) => {
  // const dataByteArray = new Uint8Array(new Buffer(JSON.stringify(data)));
  return {
    type: ACTION_TYPES.WRITE_IMMUT_DATA,
    handleId,
    data
  };
};

export const putImmutableData = (handleId, cipherOptsHandle) => ({
  type: ACTION_TYPES.PUT_IMMUT_DATA,
  handleId,
  cipherOptsHandle
});

export const closeImmutableDataWriter = (handleId) => ({
  type: ACTION_TYPES.CLOSE_IMMUT_DATA_WRITER,
  handleId
});

export const closeImmutableDataReader = (handleId) => ({
  type: ACTION_TYPES.CLOSE_IMMUT_DATA_READER,
  handleId
});
