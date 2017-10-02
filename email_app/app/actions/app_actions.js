import ACTION_TYPES from './action_types';
import { setupAccount, storeEmail, removeEmail, archiveEmail,
  fetchEmailIds, readConfig, writeConfig,
  readInboxEmails, readArchivedEmails } from '../safenet_comm';

export const refreshConfig = (emailId) => {
  return function (dispatch, getState) {
    let app = getState().initialiser.app;
    return dispatch({
      type: ACTION_TYPES.GET_CONFIG,
      payload: readConfig(app, emailId)
    });
  };
};

export const storeNewAccount = (account) => {
  return function (dispatch, getState) {
    let app = getState().initialiser.app;
    return dispatch({
      type: ACTION_TYPES.STORE_NEW_ACCOUNT,
      payload: writeConfig(app, account)
    });
  };
};

export const refreshEmail = (account) => {
  return function (dispatch, getState) {
    let spaceUsed;
    let app = getState().initialiser.app;
    return dispatch({
      type: ACTION_TYPES.REFRESH_EMAIL,
      payload: readInboxEmails(app, account,
                    (inboxEntry) => {
                      dispatch({
                        type: ACTION_TYPES.PUSH_TO_INBOX,
                        payload: inboxEntry
                      });
                })
                .then((len) => {
                  spaceUsed = len;
                  return readArchivedEmails(app, account,
                      (archiveEntry) => {
                        dispatch({
                          type: ACTION_TYPES.PUSH_TO_ARCHIVE,
                          payload: archiveEntry
                        });
                      });
                })
                .then(() => spaceUsed)
    });
  };
};

export const getEmailIds = () => {
  return function (dispatch, getState) {
    let app = getState().initialiser.app;
    return dispatch({
      type: ACTION_TYPES.FETCH_EMAIL_IDS,
      payload: fetchEmailIds(app)
    });
  };
};

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

export const sendEmail = (email, to) => {
    return function (dispatch, getState) {
      let app = getState().initialiser.app;
      return dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        msg: 'Sending email...',
        payload: storeEmail(app, email, to)
      });
    };
};

export const saveEmail = (account, key) => {
    return function (dispatch, getState) {
      let app = getState().initialiser.app;
      return dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        msg: 'Saving email...',
        payload: archiveEmail(app, account, key)
      });
    };
};

export const deleteEmail = (container, key) => {
    return function (dispatch, getState) {
      let app = getState().initialiser.app;
      return dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        msg: 'Deleting email...',
        payload: removeEmail(app, container, key)
      });
    };
};

export const cancelCompose = _ => ({
  type: ACTION_TYPES.CANCEL_COMPOSE
});
