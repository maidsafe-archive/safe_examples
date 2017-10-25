// @flow

/**
 * Actions related to Authorisation of Application
 */
/* eslint-disable import/no-named-as-default-member, import/no-named-as-default */
import api from '../lib/api';
/* eslint-enable import/no-named-as-default-member, import/no-named-as-default */
import actionTypes from './action_types';
import CONSTANTS from '../constants';

/**
 * Application authorised
 * @param {string} res - received auth response from Authenticator
 */
const appAuthorised = res => ({
  type: actionTypes.AUTHORISED,
  res,
});

/**
 * Mutable Data authorised
 * @param {string} res - received Mutable Data auth response from Authenticator
 */
const mdAuthorised = res => ({
  type: actionTypes.MD_AUTHORISED,
  payload: api.decodeSharedMD(res),
});

/**
 * Send authorisation request to Authenticator
 */
export const sendAuthReq = () => ({
  type: actionTypes.SEND_AUTH_REQUEST,
  payload: api.sendAuthReq(),
});

/**
 * Receive authorisation response from Authenticator
 * @param {string} uri - Response URI
 */
export const receiveResponse = uri => (
  (dispatch, getState) => {
    const currentState = getState();
    // handle MD auth request
    const isMDAuthorising = currentState.services.authorisingMD;
    if (isMDAuthorising) {
      return dispatch(mdAuthorised(uri));
    }

    // handle app auth request
    const isAuthorising = currentState.authorisation.authorising;
    if (isAuthorising) {
      return dispatch(appAuthorised(uri));
    }
  }
);

/**
 * Simulate mock response
 */
export const simulateMockRes = () => (
  (dispatch) => {
    api.authoriseMock()
      .then(() => dispatch(appAuthorised(CONSTANTS.MOCK_RES_URI)));
  }
);
