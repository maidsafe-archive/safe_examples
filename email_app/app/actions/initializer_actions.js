import ACTION_TYPES from './actionTypes';
import { authApp, connect, reconnect, fetchEmailIds, readConfig,
          writeConfig, readInboxEmails, readArchivedEmails } from '../safenet_comm';

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

const newNetStatusCallback = (dispatch) => {
  return function (state) {
    dispatch({
      type: ACTION_TYPES.NET_STATUS_CHANGED,
      payload: state
    });
  }
};

export const receiveResponse = (uri) => {
  return function (dispatch) {
    return dispatch({
      type: ACTION_TYPES.AUTHORISE_APP,
      payload: connect(uri, newNetStatusCallback(dispatch))
    });
  };
};

export const authoriseApplication = () => {
  return function (dispatch) {
    return dispatch({
      type: ACTION_TYPES.AUTHORISE_APP,
      payload: new Promise((resolve, reject) => {
        authApp(newNetStatusCallback(dispatch))
          .then(resolve)
          .catch(reject);
      })
    })
    .catch(_ => {});
  };
};

export const reconnectApplication = () => {
  return function (dispatch, getState) {
    let app = getState().initializer.app;
    return dispatch({
      type: ACTION_TYPES.RECONNECT_APP,
      payload: reconnect(app)
    });
  };
};

export const getEmailIds = () => {
  return function (dispatch, getState) {
    let app = getState().initializer.app;
    return dispatch({
      type: ACTION_TYPES.FETCH_EMAIL_IDS,
      payload: fetchEmailIds(app)
    });
  };
};

export const refreshConfig = (emailId) => {
  return function (dispatch, getState) {
    let app = getState().initializer.app;
    return dispatch({
      type: ACTION_TYPES.GET_CONFIG,
      payload: readConfig(app, emailId)
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
