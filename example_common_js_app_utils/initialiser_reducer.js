import ACTION_TYPES from '../actions/action_types';
import { MESSAGES, APP_STATUS, CONSTANTS, SAFE_APP_ERROR_CODES } from '../constants';

const initialState = {
  appStatus: null,
  networkStatus: null,
  processing: {
    state: false,
    msg: null
  },
  app: null,
  tasks: []
};

const initialiser = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_INITIALIZER_TASK: {
      const tasks = state.tasks.slice();
      tasks.push(action.task);
      return { ...state, tasks };
      break;
    }
    case `${ACTION_TYPES.AUTHORISE_APP}_LOADING`:
      return { ...state, app: null, appStatus: APP_STATUS.AUTHORISING };
      break;
    case `${ACTION_TYPES.AUTHORISE_APP}_SUCCESS`:
      return { ...state,
        app: action.payload,
        appStatus: APP_STATUS.AUTHORISED,
        networkStatus: CONSTANTS.NET_STATUS_CONNECTED
      };
      break;
    case `${ACTION_TYPES.AUTHORISE_APP}_ERROR`:
      status = APP_STATUS.AUTHORISATION_FAILED;
      if (action.payload.code === SAFE_APP_ERROR_CODES.ERR_AUTH_DENIED) {
        status = APP_STATUS.AUTHORISATION_DENIED;
      }
      return { ...state, appStatus: status };
      break;
    case ACTION_TYPES.NET_STATUS_CHANGED:
      return { ...state, networkStatus: action.payload };
      break;
    case `${ACTION_TYPES.RECONNECT_APP}_LOADING`:
      return { ...state, processing: { state: true, msg: 'Reconnecting...' } };
      break;
    case `${ACTION_TYPES.RECONNECT_APP}_ERROR`:
      return { ...state, processing: { state: false, msg: null } };
      break;
    case `${ACTION_TYPES.RECONNECT_APP}_SUCCESS`:
      return { ...state,
        networkStatus: CONSTANTS.NET_STATUS_CONNECTED,
        processing: { state: false, msg: null }
      };
      break;
    case `${ACTION_TYPES.AUTHORISE_SHARE_MD}_ERROR`:
      status = ACC_STATUS.AUTHORISATION_FAILED;
      if (action.payload.code === SAFE_APP_ERROR_CODES.ERR_SHARE_MDATA_DENIED) {
        status = ACC_STATUS.AUTHORISATION_DENIED;
      }
      return { ...state,
        accStatus: status,
        serviceToRegister: null,
        error: action.payload
      };
      break;
    case `${ACTION_TYPES.AUTHORISE_SHARE_MD}_SUCCESS`:
      return { ...state,
        accStatus: ACC_STATUS.CREATED,
        newAccount: action.payload,
        serviceToRegister: null
      };
      break;
    default:
      return state;
      break;
  }
};

export default initialiser;
