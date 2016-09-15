import ACTION_TYPES from './actionTypes';
import { CONSTANTS } from '../constants';

export const createAppendableData = (token, hashedEmailId) => {
  return {
    type: ACTION_TYPES.CREATE_APPENDABLE_DATA,
    payload: {
      request: {
        method: 'post',
        url: '/appendableData',
        headers: {
          'Authorization': token
        },
        data: {
          id: hashedEmailId,
          isPrivate: true,
          filterType: CONSTANTS.APPENDABLE_DATA_FILTER_TYPE.BLACK_LIST,
          filterKeys: []
        }
      }
    }
  };
};

export const fetchAppendableData = (token, handlerId) => {
  return {
    type: ACTION_TYPES.FETCH_APPENDABLE_DATA,
    payload: {
      request: {
        method: 'head',
        url: `/appendableData/${handlerId}`,
        headers: {
          'Authorization': token
        }
      }
    }
  };
};

export const fetchAppendableDataHandler = (token, id) => { // id => appendable data id
  return {
    type: ACTION_TYPES.FETCH_APPENDABLE_DATA_HANDLER,
    payload: {
      request: {
        url: `/appendableData/handle/${id}`,
        headers: {
          'Authorization': token,
          'Is-Private': true
        }
      }
    }
  };
};

export const fetchDataIdAt = (token, handlerId, index) => ({
  type: ACTION_TYPES.FETCH_DATA_ID_AT,
  payload: {
    request: {
      url: `/appendableData/${handlerId}/${index}`,
      headers: {
        'Authorization': token
      }
    }
  }
});

export const getEncryptedKey = (token, handleId) => ({
  type: ACTION_TYPES.GET_ENCRYPTED_KEY,
  payload: {
    request: {
      url: `/appendableData/encryptKey/${handleId}`,
      headers: {
        'Authorization': token
      }
    }
  }
});

export const deleteAppendableData = (token, handleId, index) => {
  return {
    type: ACTION_TYPES.DELETE_APPENDABLE_DATA,
    payload: {
      request: {
        method: 'delete',
        url: `/appendableData/${handleId}/${index}`,
        headers: {
          'Authorization': token
        }
      }
    }
  };
};

export const appendAppendableData = (token, id, dataId) => ({
  type: ACTION_TYPES.APPEND_APPENDABLE_DATA,
  payload: {
    request: {
      method: 'put',
      url: `/appendableData/${id}/${dataId}`,
      headers: {
        'Authorization': token
      }
    }
  }
});

export const clearDeleteData = (token, handleId) => ({
  type: ACTION_TYPES.CLEAR_DELETE_DATA,
  payload: {
    request: {
      method: 'delete',
      url: `/appendableData/clearDeletedData/${handleId}`,
      headers: {
        'Authorization': token
      }
    }
  }
});

export const getAppendableDataLength = (token, handleId) => ({
  type: ACTION_TYPES.GET_APPENDABLE_DATA_LENGTH,
  payload: {
    request: {
      url: `/appendableData/serialise/${handleId}`,
      headers: {
        'Authorization': token
      },
      responseType: 'arraybuffer'
    }
  }
});

export const setAppendableDataId = (id) => ({
  type: ACTION_TYPES.SET_APPENDABLE_DATA_ID,
  id
});
