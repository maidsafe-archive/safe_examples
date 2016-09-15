import ACTION_TYPES from './actionTypes';
import { CONSTANTS } from '../constants';

export const writeConfigFile = (token, coreId) => {
  return {
    type: ACTION_TYPES.WRITE_CONFIG_FILE,
    payload: {
      request: {
        method: 'post',
        url: `/nfs/file/${CONSTANTS.ROOT_PATH}/config`,
        headers: {
          'Authorization': token,
          'Content-Type': 'plain/text'
        },
        data: new Uint8Array(Buffer(coreId))
      }
    }
  }
};

export const getConfigFile = token => {
  return {
    type: ACTION_TYPES.GET_CONFIG_FILE,
    payload: {
      request: {
        url: `/nfs/file/${CONSTANTS.ROOT_PATH}/config`,
        headers: {
          'Authorization': token,
          Range: 'bytes=0-'
        },
        responseType: 'arraybuffer'
      }
    }
  };
};
