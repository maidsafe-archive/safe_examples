import ACTION_TYPES from './actionTypes';
import { authApp, connect, readConfig, writeConfig,
                    readInboxEmails, readArchivedEmails } from '../safenet_comm';

var actionResolver;
var actionRejecter;
const actionPromise = () => new Promise((resolve, reject) => {
  actionResolver = resolve;
  actionRejecter = reject;
});

export const setInitializerTask = (task) => ({
  type: ACTION_TYPES.SET_INITIALIZER_TASK,
  task
});

export const onAuthFailure = (err) => {
  return {
    type: ACTION_TYPES.AUTHORISE_APP,
    payload: actionRejecter(err)
  }
};

export const receiveResponse = (uri) => {
  return function (dispatch) {
    dispatch({
      type: ACTION_TYPES.AUTHORISE_APP,
      payload: actionPromise()
    });

    return connect(uri)
        .then(actionResolver)
        .catch(actionRejecter);
  }
};

export const authoriseApplication = () => {

  return function (dispatch) {
    dispatch({
      type: ACTION_TYPES.AUTHORISE_APP,
      payload: actionPromise()
    });

    return authApp()
        .then(actionResolver)
        .catch(actionRejecter);
  };
};

export const refreshConfig = () => {

  return function (dispatch, getState) {
    dispatch({
      type: ACTION_TYPES.GET_CONFIG,
      payload: actionPromise()
    });

    let app = getState().initializer.app;
    return readConfig(app)
        .then(actionResolver)
        .catch(actionRejecter);
  };
};

export const storeNewAccount = (account) => {

  return function (dispatch, getState) {
    dispatch({
      type: ACTION_TYPES.STORE_NEW_ACCOUNT,
      payload: actionPromise()
    });

    let app = getState().initializer.app;
    return writeConfig(app, account)
        .then(actionResolver)
        .catch(actionRejecter);
  };
};

export const refreshEmail = (account) => {

  return function (dispatch, getState) {
    dispatch({
      type: ACTION_TYPES.REFRESH_EMAIL,
      payload: actionPromise()
    });

    let app = getState().initializer.app;

    const crypto = require('crypto');
    return readInboxEmails(app, account,
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
        .then((_) => actionResolver())
        .catch(actionRejecter);
  };
};
