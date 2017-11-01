import ACTION_TYPE from '../actions/action_types';

import { parseErrorMsg } from '../utils/app';
import CONSTANTS from '../constants';

const initState = {
  nwState: CONSTANTS.NETWORK_STATE.UNKNOWN,
  connected: false,
  fetchedAccessInfo: false,
  loading: false,
  error: '',
};

export default function initialiser(state = initState, action) {
  switch (action.type) {
    case `${ACTION_TYPE.RECONNECT_APP}_PENDING`:
      return {
        ...state,
        nwState: CONSTANTS.NETWORK_STATE.INIT,
      };
    case `${ACTION_TYPE.RECONNECT_APP}_REJECTED`:
      return {
        ...state,
        nwState: CONSTANTS.NETWORK_STATE.DISCONNECTED,
      };
    case ACTION_TYPE.NET_STATUS_CHANGED:
      return {
        ...state,
        nwState: action.state,
      };

    case `${ACTION_TYPE.INITIALISE_APP}_PENDING`:
      return {
        ...state,
        loading: true,
      };
    case `${ACTION_TYPE.INITIALISE_APP}_FULFILLED`:
      return {
        ...state,
        loading: false,
      };
    case `${ACTION_TYPE.INITIALISE_APP}_REJECTED`:
      return {
        ...state,
        loading: false,
        error: action.payload ? parseErrorMsg(action.payload) : action.error,
      };
    case ACTION_TYPE.CONNECTED:
      return {
        ...state,
        connected: true,
      };
    case ACTION_TYPE.FETCHED_ACCESS_INFO:
      return {
        ...state,
        fetchedAccessInfo: true,
      };
    case ACTION_TYPE.RESET_INITIALISATION:
      return {
        ...state,
        ...initState,
      };
    default:
      return state;
  }
}
