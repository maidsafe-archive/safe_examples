import ACTION_TYPES from './actionTypes';
import * as base64 from 'urlsafe-base64';

export const serialiseDataId = (token, handleId) => ({
  type: ACTION_TYPES.SERIALISE_DATA_ID,
  payload: {
    request: {
      url: `/dataId/${handleId}`,
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
      url: '/dataId',
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
      url: `/dataId/${handleId}`,
      headers: {
        'Authorization': token
      }
    }
  }
});
