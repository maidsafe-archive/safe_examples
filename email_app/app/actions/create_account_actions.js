import ACTION_TYPES from './actionTypes';
import { setupAccount } from '../safenet_comm';

export const createAccount = (emailId) => {
  return function (dispatch, getState) {
    let app = getState().initializer.app;
    return dispatch({
      type: ACTION_TYPES.CREATE_ACCOUNT,
      payload: setupAccount(app, emailId)
                .catch((serviceToRegister) => {
                  console.log("SERVICE TO REGISTER: ", serviceToRegister)
                  return dispatch({
                    type: ACTION_TYPES.AUTHORISE_SHARE_MD,
                    payload: Promise.resolve(serviceToRegister)
                  });
                })
    });
  };
};

export const createAccountError = (error) => ({
  type: ACTION_TYPES.CREATE_ACCOUNT,
  payload: Promise.reject(error)
});
