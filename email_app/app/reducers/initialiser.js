import ACTION_TYPES from '../actions/actionTypes';
import { MESSAGES, AUTH_STATUS } from '../constants';

const initialState = {
  auth_status: null,
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
    case `${ACTION_TYPES.AUTHORISE_APP}_LOADING`: {
      return { ...state, app: null, auth_status: AUTH_STATUS.AUTHORISING };
      break;
    }
    case `${ACTION_TYPES.AUTHORISE_APP}_SUCCESS`:
      return { ...state, app: action.payload, auth_status: AUTH_STATUS.AUTHORISED };
      break;
    case `${ACTION_TYPES.AUTHORISE_APP}_ERROR`:
      return { ...state, auth_status: AUTH_STATUS.AUTHORISATION_FAILED };
      break;
    case `${ACTION_TYPES.GET_CONFIG}_LOADING`: {
      const tasks = state.tasks.slice();
      tasks.push(MESSAGES.INITIALIZE.CHECK_CONFIGURATION);
      return { ...state, tasks, auth_status: AUTH_STATUS.DONE };
      break;
    }
    case `${ACTION_TYPES.GET_CONFIG}_SUCCESS`:
      return { ...state,
        accounts: action.payload,
        coreData: { ...state.coreData, id: action.payload.id }
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
    case `${ACTION_TYPES.REFRESH_EMAIL}_SUCCESS`:
      return state;
      break;
    case `${ACTION_TYPES.REFRESH_EMAIL}_ERROR`:
      return state;
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
