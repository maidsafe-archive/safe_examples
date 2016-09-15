import ACTION_TYPES from './actionTypes';
import { CONSTANTS } from '../constants';

export const createCoreStructure = (token, id, data) => ({
  type: ACTION_TYPES.CREATE_CORE_STRUCTURE,
  payload: {
    request: {
      method: 'post',
      url: `/structuredData/${id}`,
      headers: {
        'Tag-Type': CONSTANTS.TAG_TYPE.DEFAULT,
        Encryption: CONSTANTS.ENCRYPTION.SYMMETRIC,
        'Authorization': token,
        'Content-Type': 'text/plain'
      },
      data: new Uint8Array(new Buffer(JSON.stringify(data)))
    }
  }
});

export const fetchCoreStructure = (token, id) => ({
  type: ACTION_TYPES.FETCH_CORE_STRUCTURE,
  payload: {
    request: {
      url: `/structuredData/${id}`,
      headers: {
        'Authorization': token,
        'Tag-Type': CONSTANTS.TAG_TYPE.DEFAULT,
        Encryption: CONSTANTS.ENCRYPTION.SYMMETRIC,
        'Content-Type': 'text/plain'
      }
    }
  }
});

export const fetchCoreStructureHandler = (token, id) => ({
  type: ACTION_TYPES.FETCH_CORE_STRUCTURE_HANDLER,
  payload: {
    request: {
      url: `/structuredData/handle/${id}`,
      headers: {
        'Tag-Type': CONSTANTS.TAG_TYPE.DEFAULT,
        'Authorization': token
      }
    }
  }
});

export const updateCoreStructure = (token, id, data) => ({
  type: ACTION_TYPES.UPDATE_CORE_STRUCTURE,
  payload: {
    request: {
      method: 'put',
      url: `/structuredData/${id}`,
      headers: {
        'Content-Type': 'text/plain',
        'Tag-Type': CONSTANTS.TAG_TYPE.DEFAULT,
        Encryption: CONSTANTS.ENCRYPTION.SYMMETRIC,
        'Authorization': token
      },
      data: new Uint8Array(new Buffer(JSON.stringify(data)))
    }
  }
});
