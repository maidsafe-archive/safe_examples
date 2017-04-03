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

    // FIXME: store private key for encryption in app's container mapped to emailId

    let app = getState().initializer.app;
    return app.mutableData.newRandomPublic(CONSTANTS.INBOX_TAG_TYPE)
        .then((md) => md.quickSetup({}))
        // FIXME: map this address to emailId in publicNames
        .then((md) => accountResolver(md))
        .catch(accountRejecter);
  };
};

export const createAccountError = (error) => ({
  type: ACTION_TYPES.CREATE_ACCOUNT_ERROR,
  error
});
