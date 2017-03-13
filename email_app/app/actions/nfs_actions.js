import ACTION_TYPES from './actionTypes';
import { CONSTANTS } from '../constants';

export const writeConfigFile = (coreId) => {
  // FIXME: are these even needed?
  return {
    type: ACTION_TYPES.WRITE_CONFIG_FILE,
    coreId
  }
};

export const getConfigFile = () => {
  return {
    type: ACTION_TYPES.GET_CONFIG_FILE
  };
};
