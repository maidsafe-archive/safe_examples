import ACTION_TYPES from './actionTypes';
import { setupAccount } from '../safenet_comm';

var actionResolver;
var actionRejecter;
const actionPromise = new Promise((resolve, reject) => {
  actionResolver = resolve;
  actionRejecter = reject;
});

export const createAccount = (emailId) => {
  return function (dispatch, getState) {
    dispatch({
      type: ACTION_TYPES.CREATE_ACCOUNT,
      payload: actionPromise
    });

    let app = getState().initializer.app;
    return setupAccount(app, emailId)
        .then(actionResolver)
        .catch(actionRejecter);
  };
};

export const createAccountError = (error) => ({
  type: ACTION_TYPES.CREATE_ACCOUNT_ERROR,
  error
});
