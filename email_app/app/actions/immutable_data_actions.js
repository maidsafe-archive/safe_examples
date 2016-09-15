import ACTION_TYPES from './actionTypes';
import { CONSTANTS } from '../constants';

export const fetchMail = (token, handleId) => ({
  type: ACTION_TYPES.FETCH_MAIL,
  payload: {
    request: {
      url: `/immutableData/${handleId}`,
      headers: {
        'Authorization': token
      },
      responseType: 'arraybuffer'
    }
  }
});

export const createMail = (token, data, encryptKeyHandler) => ({
  type: ACTION_TYPES.CREATE_MAIL,
  payload: {
    request: {
      method: 'post',
      url: '/immutableData',
      headers: {
        'Content-Type': 'text/plain',
        encryption: CONSTANTS.IMMUT_ENCRYPTION_TYPE.ASYMMETRIC,
        'encrypt-key-handle': encryptKeyHandler,
        'Authorization': token
      },
      data: new Uint8Array(new Buffer(JSON.stringify(data)))
    }
  }
});
