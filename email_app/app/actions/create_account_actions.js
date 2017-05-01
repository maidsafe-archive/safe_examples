import ACTION_TYPES from './actionTypes';
import { setupAccount } from '../safenet_comm';

export const createAccount = (emailId) => {
  return function (dispatch, getState) {
    let app = getState().initializer.app;
    return dispatch({
      type: ACTION_TYPES.CREATE_ACCOUNT,
      payload: setupAccount(app, emailId)
    });
  };
};

export const createAccountError = (error) => ({
  type: ACTION_TYPES.CREATE_ACCOUNT_ERROR,
  error
});
