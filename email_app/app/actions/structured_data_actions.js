import ACTION_TYPES from './actionTypes';
import { CONSTANTS } from '../constants';

export const createStructuredData = (token, name, data, cipherHandle) => ({
  type: ACTION_TYPES.CREATE_STRUCTURED_DATA,
  payload: {
    request: {
      method: 'post',
      url: '/structured-data',
      headers: {
        'Authorization': token
      },
      data: {
        name,
        typeTag: CONSTANTS.TAG_TYPE.DEFAULT,
        cipherOpts: cipherHandle,
        data: new Buffer(JSON.stringify(data)).toString('base64')
      }
    }
  }
});

export const fetchStructuredData = (token, handleId) => ({
  type: ACTION_TYPES.FETCH_STRUCTURED_DATA,
  payload: {
    request: {
      url: `/structured-data/${handleId}`,
      headers: {
        'Authorization': token,
        'Content-Type': 'text/plain'
      }
    }
  }
});

export const fetchStructuredDataHandle = (token, dataIdHandle) => ({
  type: ACTION_TYPES.FETCH_STRUCTURE_DATA_HANDLE,
  payload: {
    request: {
      url: `/structured-data/handle/${dataIdHandle}`,
      headers: {
        'Authorization': token
      }
    }
  }
});

export const fetchStructuredDataIdHandle = (token, handleId) => ({
  type: ACTION_TYPES.FETCH_STRUCTURE_DATA_ID_HANDLE,
  payload: {
    request: {
      url: `/structured-data/data-id/${handleId}`,
      headers: {
        'Authorization': token
      }
    }
  }
});

export const updateStructuredData = (token, handleId, data, cipherOpts) => ({
  type: ACTION_TYPES.UPDATE_STRUCTURED_DATA,
  payload: {
    request: {
      method: 'patch',
      url: `/structured-data/${handleId}`,
      headers: {
        'Authorization': token
      },
      data: {
        cipherOpts,
        data: new Buffer(JSON.stringify(data)).toString('base64')
      }
    }
  }
});

export const dropStructuredDataHandle = (token, handleId) => ({
  type: ACTION_TYPES.DROP_STRUCTURED_DATA_HANDLE,
  payload: {
    request: {
      method: 'delete',
      url: `/structured-data/handle/${handleId}`,
      headers: {
        'Authorization': token
      }
    }
  }
});

export const postStructuredData = (token, handleId) => ({
  type: ACTION_TYPES.POST_STRUCTURED_DATA,
  payload: {
    request: {
      method: 'post',
      url: `/structured-data/${handleId}`,
      headers: {
        'Authorization': token
      }
    }
  }
});

export const putStructuredData = (token, handleId) => ({
  type: ACTION_TYPES.PUT_STRUCTURED_DATA,
  payload: {
    request: {
      method: 'put',
      url: `/structured-data/${handleId}`,
      headers: {
        'Authorization': token
      }
    }
  }
});

