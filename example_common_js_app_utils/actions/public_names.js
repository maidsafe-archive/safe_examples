import ACTION_TYPES from './action_types';
import { fetchPublicNames } from '../safe_comm/app';

export const newPublicName = name => {
  return (dispatch, getState) => {
    const app = getState().initialiser.app;
    return dispatch({
      type: ACTION_TYPES.CREATE_PUBLIC_NAME,
      payload: createPublicName(app, name),
    })
  };
};

export const getPublicNamesList = () => {
  return (dispatch, getState) => {
    const app = getState().initialiser.app;
    return dispatch({
      type: ACTION_TYPES.FETCH_PUBLIC_NAMES,
      payload: fetchPublicNames(app),
    })
  };
};
