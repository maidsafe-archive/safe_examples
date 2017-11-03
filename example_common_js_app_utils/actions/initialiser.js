import ACTION_TYPES from './action_types';
import { requestAuth, requestSharedMDAuth, connect, connectWithSharedMd } from '../safe_comm/network';
import CONSTANTS from '../constants';

const newNetStatusCallback = (dispatch) => {
  return function (state) {
    dispatch({
      type: ACTION_TYPES.NET_STATUS_CHANGED,
      payload: state
    });
  }
};

const connectApp = (uri, dispatch) => ({
  type: ACTION_TYPES.CONNECT_APP,
  payload: connect(uri, newNetStatusCallback(dispatch)),
});

const connectSharedMD = (app, uri, serviceToRegister) => ({
  type: ACTION_TYPES.CONNECT_SHARE_MD,
  payload: connectWithSharedMd(app, uri),
});

/**
 * Send authorisation request to Authenticator
 */
export const authoriseApplication = () => ({
  type: ACTION_TYPES.AUTHORISE_APP,
  payload: requestAuth(),
});

export const authoriseSharedMD = publicName => {
  return (dispatch, getState) => {
    const app = getState().initialiser.app;
    return dispatch({
      type: ACTION_TYPES.AUTHORISE_APP,
      payload: requestSharedMDAuth(app, publicName),
    })
  };
};

export const receiveResponse = (uri) => {
  return function (dispatch, getState) {
    const initialiserState = getState().initialiser;
    const appStatus = initialiserState.appStatus;
    // handle app authorisation
    if (appStatus === CONSTANTS.APP_STATUS.AUTHORISED) {
      return dispatch(connectApp(uri, dispatch));
    }

    // handle shared MD authorisation
    const sharedMDAuthStatus = initialiserState.sharedMDAuthStatus;
    if (sharedMDAuthStatus === CONSTANTS.APP_STATUS.AUTHORISED) {
      let app = initialiserState.app;
      return dispatch(connectSharedMD(app, uri));
    }
  };
};

export const reconnectApplication = () => {
  return function (dispatch, getState) {
    const app = getState().initialiser.app;
    return dispatch({
      type: ACTION_TYPES.RECONNECT_APP,
      payload: reconnect(app)
    });
  };
};
