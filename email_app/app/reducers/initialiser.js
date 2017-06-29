import ACTION_TYPES from '../actions/actionTypes';
import { MESSAGES, APP_STATUS, CONSTANTS, SAFE_APP_ERROR_CODES } from '../constants';

const initialState = {
  app_status: null,
  network_status: null,
  app: null,
  tasks: [],
  accounts: [],
  coreData: {
    id: '',
    inbox: [],
    saved: []
  },
  inboxSize: 0,
  savedSize: 0
};

const initializer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_INITIALIZER_TASK: {
      const tasks = state.tasks.slice();
      tasks.push(action.task);
      return { ...state, tasks };
      break;
    }
    case `${ACTION_TYPES.AUTHORISE_APP}_LOADING`:
      return { ...state, app: null, app_status: APP_STATUS.AUTHORISING };
      break;
    case `${ACTION_TYPES.AUTHORISE_APP}_SUCCESS`:
      return { ...state,
        app: action.payload,
        app_status: APP_STATUS.AUTHORISED,
        network_status: CONSTANTS.NET_STATUS_CONNECTED
      };
      break;
    case `${ACTION_TYPES.AUTHORISE_APP}_ERROR`:
      status = APP_STATUS.AUTHORISATION_FAILED;
      if (action.payload.code === SAFE_APP_ERROR_CODES.ERR_AUTH_DENIED) {
        status = APP_STATUS.AUTHORISATION_DENIED;
      }
      return { ...state, app_status: status };
      break;
    case ACTION_TYPES.NET_STATUS_CHANGED:
      return { ...state, network_status: action.payload };
      break;
    case `${ACTION_TYPES.GET_CONFIG}_LOADING`:
      return { ...state, app_status: APP_STATUS.READING_CONFIG };
      break;
    case `${ACTION_TYPES.GET_CONFIG}_SUCCESS`:
      return { ...state,
        accounts: action.payload,
        coreData: { ...state.coreData, id: action.payload.id },
        app_status: APP_STATUS.READY
      };
      break;
    case `${ACTION_TYPES.STORE_NEW_ACCOUNT}_SUCCESS`:
      return { ...state,
        accounts: action.payload,
        coreData: { ...state.coreData, id: action.payload.id }
      };
      break;
    case `${ACTION_TYPES.REFRESH_EMAIL}_LOADING`:
      return { ...state,
        coreData: { ...state.coreData, inbox: [], saved: [] },
        inboxSize: 0,
        savedSize: 0
      };
      break;
    case ACTION_TYPES.PUSH_TO_INBOX: {
      let inbox = Object.assign({}, state.coreData.inbox, action.payload);
      return { ...state,
        coreData: { ...state.coreData, inbox },
        inboxSize: Object.keys(inbox).length
      };
      break;
    }
    case ACTION_TYPES.PUSH_TO_ARCHIVE: {
      let saved = Object.assign({}, state.coreData.saved, action.payload);
      return { ...state,
        coreData: { ...state.coreData, saved },
        savedSize: Object.keys(saved).length
      };
      break;
    }
    default:
      return state;
      break;
  }
};

export default initializer;
