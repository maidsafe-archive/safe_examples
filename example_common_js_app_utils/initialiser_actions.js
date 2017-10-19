import ACTION_TYPES from './action_types';
import { APP_STATUS } from '../constants';
import { authApp, connect, reconnect, connectWithSharedMd } from '../safenet_comm';

export const setInitialiserTask = (task) => ({
  type: ACTION_TYPES.SET_INITIALISER_TASK,
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
  return function (dispatch, getState) {
    let appStatus = getState().initialiser.appStatus;
    if (appStatus === APP_STATUS.AUTHORISED) {
      return dispatch({
        type: ACTION_TYPES.AUTHORISE_APP,
        payload: connect(uri, newNetStatusCallback(dispatch))
      });
    } else {
      let app = getState().initialiser.app;
      let serviceToRegister = getState().createAccount.serviceToRegister;
      return dispatch({
        type: ACTION_TYPES.AUTHORISE_SHARE_MD,
        payload: connectWithSharedMd(app, uri, serviceToRegister)
      });
    }
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
    .catch((err) => {console.log("Error1: ", err)});
  };
};

export const reconnectApplication = () => {
  return function (dispatch, getState) {
    let app = getState().initialiser.app;
    return dispatch({
      type: ACTION_TYPES.RECONNECT_APP,
      payload: reconnect(app)
    });
  };
};
