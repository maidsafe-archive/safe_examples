import { CONSTANTS } from '../constants';
import ACTION_TYPES from './actionTypes';

var accountResolver;
var accountRejecter;
const accountPromise = new Promise((resolve, reject) => {
  accountResolver = resolve;
  accountRejecter = reject;
});

export const createAccount = (emailId) => {
  return function (dispatch, getState) {
    dispatch({
      type: ACTION_TYPES.CREATE_ACCOUNT,
      payload: accountPromise
    });

    let app = getState().initializer.app;
    return app.mutableData.newRandomPublic(CONSTANTS.INBOX_TAG_TYPE)
        .then((md) => md.quickSetup({}))
        .then((md) => accountResolver({id: emailId, md_inbox: md}))
        .catch(accountRejecter);
  };
};

export const createAccountError = (error) => ({
  type: ACTION_TYPES.CREATE_ACCOUNT_ERROR,
  error
});
