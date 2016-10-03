import ACTION_TYPES from './actionTypes';

export const createImmutableDataWriterHandle = (token) => ({
  type: ACTION_TYPES.CREATE_IMMUT_WRITER_HANDLE,
  payload: {
    request: {
      url: `/immutable-data/writer`,
      headers: {
        'Authorization': token
      }
    }
  }
});

export const getImmutableDataReadHandle = (token, handleId) => ({
  type: ACTION_TYPES.GET_IMMUT_READ_HANDLE,
  payload: {
    request: {
      url: `/immutable-data/reader/${handleId}`,
      headers: {
        'Authorization': token
      }
    }
  }
});

export const readImmutableData = (token, handleId) => ({
  type: ACTION_TYPES.READ_IMMUT_DATA,
  payload: {
    request: {
      url: `/immutable-data/${handleId}`,
      headers: {
        'Authorization': token
      },
      responseType: 'arraybuffer'
    }
  }
});

export const writeImmutableData = (token, handleId, data) => {
  const dataByteArray = new Uint8Array(new Buffer(JSON.stringify(data)));
  return {
    type: ACTION_TYPES.WRITE_IMMUT_DATA,
    payload: {
      request: {
        method: 'post',
        url: `/immutable-data/${handleId}`,
        headers: {
          'content-type': 'text/plain',
          'Authorization': token
        },
        data: dataByteArray
      }
    }
  };
};

export const putImmutableData = (token, handleId, cipherOptsHandle) => ({
  type: ACTION_TYPES.PUT_IMMUT_DATA,
  payload: {
    request: {
      method: 'put',
      url: `/immutable-data/${handleId}/${cipherOptsHandle}`,
      headers: {
        'Authorization': token,
      }
    }
  }
});

export const closeImmutableDataWriter = (token, handleId) => ({
  type: ACTION_TYPES.CLOSE_IMMUT_DATA_WRITER,
  payload: {
    request: {
      method: 'delete',
      url: `/immutable-data/writer/${handleId}`,
      headers: {
        'Authorization': token,
      }
    }
  }
});

export const closeImmutableDataReader = (token, handleId) => ({
  type: ACTION_TYPES.CLOSE_IMMUT_DATA_READER,
  payload: {
    request: {
      method: 'delete',
      url: `/immutable-data/reader/${handleId}`,
      headers: {
        'Authorization': token,
      }
    }
  }
});
