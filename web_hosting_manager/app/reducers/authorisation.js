import actionTypes from '../actions/action_types';

import CONSTANTS from '../constants';

const initState = {
  ...CONSTANTS.UI.COMMON_STATE,
  authorising: false,
  authorised: false,
  authRes: null,
};

export default function authorisation(state = initState, action) {
  switch (action.type) {
    case `${actionTypes.AUTHORISE_APP}_PENDING`:
      return {
        ...state,
        authorising: true,
        processing: true,
      };
    case `${actionTypes.AUTHORISE_APP}_FULFILLED`:
      return {
        ...state,
        authorising: true,
        processing: false,
      };
    case `${actionTypes.AUTHORISE_APP}_REJECTED`:
      return {
        ...state,
        authorising: false,
        processing: false,
        error: action.payload.message,
      };
    case actionTypes.APP_AUTHORISED: {
      const authRes = ((action.res.search('safe-') === 0) && !(action.res.search('safe-auth') === 0)) ? action.res : null;
      return {
        ...state,
        authorising: false,
        processing: false,
        authorised: !!authRes,
        error: '',
        authRes,
      };
    }
    case actionTypes.RESET:
      return {
        ...state,
        ...CONSTANTS.UI.COMMON_STATE,
        authorising: false,
        authorised: false,
      };
    default:
      return state;
  }
}
