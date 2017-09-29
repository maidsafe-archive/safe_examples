import ACTION_TYPES from './actionTypes';
import { setupAccount } from '../safenet_comm';

export const createAccount = (emailId) => {
  return function (dispatch, getState) {
    let app = getState().initialiser.app;
    return dispatch({
      type: ACTION_TYPES.CREATE_ACCOUNT,
      payload: setupAccount(app, emailId)
    });
  };
};

export const resetCurrentAccount = () => ({
    type: ACTION_TYPES.CREATE_ACCOUNT_RESET,
    payload: Promise.resolve()
});

export const createAccountError = (error) => ({
  type: ACTION_TYPES.CREATE_ACCOUNT,
  payload: Promise.reject(error)
});
