import { CONSTANTS } from '../constants';
import ACTION_TYPES from './actionTypes';

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
    return app.mutableData.newRandomPublic(CONSTANTS.INBOX_TAG_TYPE)
        .then((md) => md.quickSetup({})) // FIXME: set corresponding permissions
        .then((md) => actionResolver({id: emailId, md_inbox: md}))
        .catch(actionRejecter);
  };
};

export const createAccountError = (error) => ({
  type: ACTION_TYPES.CREATE_ACCOUNT_ERROR,
  error
});
