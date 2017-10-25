// @flow

/* eslint-disable import/no-named-as-default-member, import/no-named-as-default */
import api from '../lib/api';
/* eslint-enable import/no-named-as-default-member, import/no-named-as-default */
import ACTION_TYPES from './action_types';

/**
 * Callback function for Network state change - Set the network state on change
 * @param dispatch
 * @return {Function}
 */
const nwStateCallback = dispatch => (
  (state) => {
    dispatch({
      type: ACTION_TYPES.NW_STATUS_CHANGED,
      state,
    });
  }
);

/**
 * Action - Connected to SAFE Network
 */
const connected = () => ({
  type: ACTION_TYPES.CONNECTED,
});

/**
 * Action - Checked for access requested Containers access
 */
const fetchedAccessInfo = () => ({
  type: ACTION_TYPES.FETCHED_ACCESS_INFO,
});

/**
 * Initialise of application includes
 * - Connect to SAFE Network after Authorisation from Authenticator.
 * - Check for access to requested containers.
 */
export const initialiseApp = () => (
  (dispatch, getState) => {
    const state = getState();
    if (!(state.authorisation.authorised && state.authorisation.authRes)) {
      dispatch({
        type: `${ACTION_TYPES.INITIALISE_APP}_REJECTED`,
        error: new Error('Application not authorised.'),
      });
      return;
    }
    return dispatch({
      type: ACTION_TYPES.INITIALISE_APP,
      payload: api.connect(state.authorisation.authRes, nwStateCallback(dispatch))
        .then(() => {
          dispatch(connected());
          // check access container permission
          return api.canAccessContainers();
        })
        .then(() => {
          dispatch(fetchedAccessInfo());
        }),
    });
  }
);

// Reset to initial state
export const reset = () => ({
  type: ACTION_TYPES.RESET_INITIALISATION,
});
