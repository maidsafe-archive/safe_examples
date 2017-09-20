import actionTypes from '../actions/action_types';

import CONSTANTS from '../constants';

const initState = {
  ...CONSTANTS.UI.COMMON_STATE,
  authorised: false,
  authRes: null
};

export default function authorisation(state = initState, action) {
  switch (action.type) {
    case `${actionTypes.SEND_AUTH_REQUEST}_FULFILLED`:
      return {
        ...state,
        processing: true
      };
    case `${actionTypes.SEND_AUTH_REQUEST}_REJECTED`:
      return {
        ...state,
        processing: false,
        error: action.payload.message
      };
    case actionTypes.AUTHORISED:
      const authRes = action.res.search('safe-') === 0 ? action.res : null;
      return {
        ...state,
        processing: false,
        authorised: true,
        error: null,
        authRes
      };
    case actionTypes.RESET:
      return {
        ...state,
        ...CONSTANTS.UI.COMMON_STATE,
        authorised: false
      };
    default:
      return state;
  }
}
