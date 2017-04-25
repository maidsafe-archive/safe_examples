import ACTION_TYPES from './actionTypes';
import { authApp, connect, readConfig, writeConfig,
                    readInboxEmails, readArchivedEmails } from '../safenet_comm';

export const setInitializerTask = (task) => ({
  type: ACTION_TYPES.SET_INITIALIZER_TASK,
  task
});

export const onAuthFailure = (err) => {
  return {
    type: ACTION_TYPES.AUTHORISE_APP,
    payload: Promise.reject(err)
  };
};

export const receiveResponse = (uri) => {
  return function (dispatch) {
    return dispatch({
      type: ACTION_TYPES.AUTHORISE_APP,
      payload: connect(uri)
    });
  };
};

export const authoriseApplication = () => {
  return function (dispatch) {
    return dispatch({
      type: ACTION_TYPES.AUTHORISE_APP,
      payload: new Promise((resolve, reject) => {
        authApp()
          .then(resolve)
          .catch(reject);
      })
    })
    .catch(_ => {});
  };
};

export const refreshConfig = () => {
  return function (dispatch, getState) {
    let app = getState().initializer.app;
    return dispatch({
      type: ACTION_TYPES.GET_CONFIG,
      payload: readConfig(app)
    });
  };
};

export const storeNewAccount = (account) => {
  return function (dispatch, getState) {
    let app = getState().initializer.app;
    return dispatch({
      type: ACTION_TYPES.STORE_NEW_ACCOUNT,
      payload: writeConfig(app, account)
    });
  };
};

export const refreshEmail = (account) => {
  return function (dispatch, getState) {
    let app = getState().initializer.app;
    return dispatch({
      type: ACTION_TYPES.REFRESH_EMAIL,
      payload: readInboxEmails(app, account,
                    (inboxEntry) => {
                      dispatch({
                        type: ACTION_TYPES.PUSH_TO_INBOX,
                        payload: inboxEntry
                      });
                })
                .then(() => readArchivedEmails(app, account,
                    (archiveEntry) => {
                      dispatch({
                        type: ACTION_TYPES.PUSH_TO_ARCHIVE,
                        payload: archiveEntry
                      });
                }))
    });
  };
};
