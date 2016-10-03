import ACTION_TYPES from './actionTypes';
import { CONSTANTS } from '../constants';

export const createAppendableData = (token, name) => {
  return {
    type: ACTION_TYPES.CREATE_APPENDABLE_DATA,
    payload: {
      request: {
        method: 'post',
        url: '/appendable-data',
        headers: {
          'Authorization': token
        },
        data: {
          name,
          isPrivate: true,
          filterType: CONSTANTS.APPENDABLE_DATA_FILTER_TYPE.BLACK_LIST,
          filterKeys: []
        }
      }
    }
  };
};

export const fetchAppendableDataMeta = (token, handleId) => {
  return {
    type: ACTION_TYPES.FETCH_APPENDABLE_DATA_META,
    payload: {
      request: {
        url: `/appendable-data/metadata/${handleId}`,
        headers: {
          'Authorization': token
        }
      }
    }
  };
};

export const fetchAppendableDataHandle = (token, dataIdHandle) => { // id => appendable data id
  return {
    type: ACTION_TYPES.FETCH_APPENDABLE_DATA_HANDLER,
    payload: {
      request: {
        url: `/appendable-data/handle/${dataIdHandle}`,
        headers: {
          'Authorization': token,
          'Is-Private': true
        }
      }
    }
  };
};

export const fetchDataIdAt = (token, handleId, index) => ({
  type: ACTION_TYPES.FETCH_DATA_ID_AT,
  payload: {
    request: {
      url: `/appendable-data/${handleId}/${index}`,
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
      url: `/appendable-data/encrypt-key/${handleId}`,
      headers: {
        'Authorization': token
      }
    }
  }
});

export const deleteEncryptedKey = (token, handleId) => ({
  type: ACTION_TYPES.DELETE_ENCRYPTED_KEY,
  payload: {
    request: {
      method: 'delete',
      url: `/appendable-data/encrypt-key/${handleId}`,
      headers: {
        'Authorization': token
      }
    }
  }
});

export const removeFromAppendableData = (token, handleId, index) => {
  return {
    type: ACTION_TYPES.REMOVE_FROM_APPENDABLE_DATA,
    payload: {
      request: {
        method: 'delete',
        url: `/appendable-data/${handleId}/${index}`,
        headers: {
          'Authorization': token
        }
      }
    }
  };
};

export const appendAppendableData = (token, handleId, dataIdHandle) => ({
  type: ACTION_TYPES.APPEND_APPENDABLE_DATA,
  payload: {
    request: {
      method: 'put',
      url: `/appendable-data/${handleId}/${dataIdHandle}`,
      headers: {
        'Authorization': token
      }
    }
  }
});

export const clearDeletedData = (token, handleId) => ({
  type: ACTION_TYPES.CLEAR_DELETE_DATA,
  payload: {
    request: {
      method: 'delete',
      url: `/appendable-data/clear-deleted-data/${handleId}`,
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
      url: `/appendable-data/serialise/${handleId}`,
      headers: {
        'Authorization': token
      },
      responseType: 'arraybuffer'
    }
  }
});

export const dropAppendableDataHandle = (token, handleId) => ({
  type: ACTION_TYPES.DROP_APPENDABLE_DATA_HANDLE,
  payload: {
    request: {
      method: 'delete',
      url: `/appendable-data/handle/${handleId}`,
      headers: {
        'Authorization': token
      }
    }
  }
});


export const postAppendableData = (token, handleId) => ({
  type: ACTION_TYPES.POST_APPENDABLE_DATA,
  payload: {
    request: {
      method: 'post',
      url: `/appendable-data/${handleId}`,
      headers: {
        'Authorization': token
      }
    }
  }
});

export const putAppendableData = (token, handleId) => ({
  type: ACTION_TYPES.PUT_APPENDABLE_DATA,
  payload: {
    request: {
      method: 'put',
      url: `/appendable-data/${handleId}`,
      headers: {
        'Authorization': token
      }
    }
  }
});

export const setAppendableDataId = (id) => ({
  type: ACTION_TYPES.SET_APPENDABLE_DATA_ID,
  id
});
