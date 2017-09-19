// @flow
import api from '../lib/api';
import actionTypes from './action_types';

const appAuthorised = (res) => ({
  type: actionTypes.AUTHORISED,
  res
});

const mdAuthorised = (res) => ({
  type: actionTypes.MD_AUTHORISED,
  payload: api.connectSharedMD(res)
});

/**
 * action to send authorisation request to Authenticator
 */
export const sendAuthReq = () => ({
  type: actionTypes.SEND_AUTH_REQUEST,
  payload: api.sendAuthReq()
});

/**
 * action to receive authorisation response from Authenticator
 */
export const receiveResponse = (uri) => {
  return (dispatch, getState) => {
    const currentState = getState();
    // handle MD auth request
    const isMDAuthorising = currentState.services.authorisingMD;
    if (isMDAuthorising) {
      console.log('MD auth res', uri);
      return dispatch(mdAuthorised(uri));
    }
    // handle app auth request
    const isAuthorising = currentState.authorisation.processing;
    if (isAuthorising) {
      return dispatch(appAuthorised(uri));
    }
  };
};

/**
 * action to reconnect the app with Safe Network
 */
export const reconnectApp = () => ({
    type: actionTypes.RECONNECT_APP,
    payload: api.reconnect()
});

export const reset = () => ({
  type: actionTypes.RESET_AUTHORISATION
});
