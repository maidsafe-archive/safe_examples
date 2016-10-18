import ACTION_TYPES from './actionTypes';
import * as base64 from 'urlsafe-base64';

export const getStructuredDataIdHandle = (token, name, typeTag) => ({
  type: ACTION_TYPES.GET_STRUCTURED_DATA_ID_HANDLE,
  payload: {
    request: {
      method: 'post',
      url: '/data-id/structured-data',
      headers: {
        'Authorization': token
      },
      data: {
        typeTag,
        name
      }
    }
  }
});

export const getAppendableDataIdHandle = (token, name) => ({
  type: ACTION_TYPES.GET_STRUCTURED_DATA_ID_HANDLE,
  payload: {
    request: {
      method: 'post',
      url: '/data-id/appendable-data',
      headers: {
        'Authorization': token
      },
      data: {
        isPrivate: true,
        name
      }
    }
  }
});

export const serialiseDataId = (token, handleId) => ({
  type: ACTION_TYPES.SERIALISE_DATA_ID,
  payload: {
    request: {
      url: `/data-id/${handleId}`,
      headers: {
        'Authorization': token
      },
      responseType: 'arraybuffer'
    }
  }
});

export const deserialiseDataId = (token, data) => ({
  type: ACTION_TYPES.DESERIALISE_DATA_ID,
  payload: {
    request: {
      method: 'post',
      url: '/data-id',
      headers: {
        'Content-Type': 'text/plain',
        'Authorization': token
      },
      data: new Uint8Array(base64.decode(data))
    }
  }
});

export const dropHandler = (token, handleId) => ({
  type: ACTION_TYPES.DROP_HANDLER,
  payload: {
    request: {
      method: 'delete',
      url: `/data-id/${handleId}`,
      headers: {
        'Authorization': token
      }
    }
  }
});
