import ACTION_TYPES from '../actions/actionTypes';
import { MESSAGES, APP_STATUS, CONSTANTS, SAFE_APP_ERROR_CODES } from '../constants';

const initialState = {
  appStatus: null,
  networkStatus: null,
  processing: {
    state: false,
    msg: null
  },
  app: null,
  tasks: [],
  emailIds: [],
  account: [],
  coreData: {
    id: '',
    inbox: [],
    saved: []
  },
  inboxSize: 0,
  savedSize: 0,
  spaceUsed: 0
};

const pushEmailSorted = (list, item) => {
  let index = list.findIndex((elem) => {
    return elem.time <= item.email.time;
  });
  item.email.id = item.id;
  if (index < 0) {
    list.push(item.email);
  } else {
    list.splice(index, 0, item.email);
  }
  return list;
}

const initializer = (state = initialState, action) => {
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
    case `${ACTION_TYPES.FETCH_EMAIL_IDS}_LOADING`:
      return { ...state, appStatus: APP_STATUS.FETCHING_EMAIL_IDS };
      break;
    case `${ACTION_TYPES.FETCH_EMAIL_IDS}_SUCCESS`:
      return { ...state, emailIds: action.payload };
      break;
    case `${ACTION_TYPES.GET_CONFIG}_LOADING`:
      return { ...state,
        appStatus: APP_STATUS.READING_CONFIG,
        processing: { state: true, msg: 'Reading emails...' }
      };
      break;
    case `${ACTION_TYPES.GET_CONFIG}_SUCCESS`:
      return { ...state,
        account: action.payload,
        coreData: { ...state.coreData, id: action.payload.id },
        appStatus: APP_STATUS.READY,
        processing: { state: false, msg: null }
      };
      break;
    case `${ACTION_TYPES.CREATE_ACCOUNT}_LOADING`:
      return { ...state, processing: { state: true, msg: 'Creating email ID...' } };
      break;
    case `${ACTION_TYPES.CREATE_ACCOUNT}_ERROR`:
    case `${ACTION_TYPES.CREATE_ACCOUNT}_SUCCESS`:
      return { ...state, processing: { state: false, msg: null } };
      break;
    case `${ACTION_TYPES.STORE_NEW_ACCOUNT}_LOADING`:
      return { ...state, processing: { state: true, msg: 'Storing email info...' } };
      break;
    case `${ACTION_TYPES.STORE_NEW_ACCOUNT}_SUCCESS`:
      return { ...state,
        account: action.payload,
        coreData: { ...state.coreData, id: action.payload.id },
        processing: { state: false, msg: null }
      };
      break;
    case `${ACTION_TYPES.STORE_NEW_ACCOUNT}_ERROR`:
      return { ...state, processing: { state: false, msg: null } };
      break;
    case `${ACTION_TYPES.REFRESH_EMAIL}_LOADING`:
      return { ...state,
        coreData: { ...state.coreData, inbox: [], saved: [] },
        inboxSize: 0,
        savedSize: 0,
        processing: { state: true, msg: 'Reading emails...' }
      };
      break;
    case `${ACTION_TYPES.REFRESH_EMAIL}_SUCCESS`:
      return { ...state,
        spaceUsed: action.payload,
        processing: { state: false, msg: null }
      };
      break;
    case `${ACTION_TYPES.REFRESH_EMAIL}_ERROR`:
      return { ...state, processing: { state: false, msg: null } };
      break;
    case `${ACTION_TYPES.MAIL_PROCESSING}_LOADING`:
      return { ...state, processing: { state: true, msg: action.msg } };
      break;
    case `${ACTION_TYPES.MAIL_PROCESSING}_SUCCESS`:
    case `${ACTION_TYPES.MAIL_PROCESSING}_ERROR`:
      return { ...state, processing: { state: false, msg: null } };
      break;
    case ACTION_TYPES.PUSH_TO_INBOX: {
      let inbox = state.coreData.inbox.slice();
      pushEmailSorted(inbox, action.payload);
      return { ...state,
        coreData: { ...state.coreData, inbox },
        inboxSize: inbox.length
      };
      break;
    }
    case ACTION_TYPES.PUSH_TO_ARCHIVE: {
      let saved = state.coreData.saved.slice();
      pushEmailSorted(saved, action.payload);
      return { ...state,
        coreData: { ...state.coreData, saved },
        savedSize: saved.length
      };
      break;
    }
    default:
      return state;
      break;
  }
};

export default initializer;
