import ACTION_TYPES from '../actions/action_types';
import { ACC_STATUS, SAFE_APP_ERROR_CODES, APP_STATUS } from '../constants';

const initialState = {
  error: {},
  emailIds: [],
  accStatus: null,
  newAccount: null,
  serviceToRegister: null,
  account: [],
  inboxSize: 0,
  savedSize: 0,
  spaceUsed: 0,
  processing: {
    state: false,
    msg: null
  },
  appStatus: null,
  coreData: {
    id: '',
    inbox: [],
    saved: []
  }
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

const mail = (state = initialState, action) => {
  switch (action.type) {
    case `${ACTION_TYPES.GET_CONFIG}_SUCCESS`:
      return { ...state,
        account: action.payload,
        coreData: { ...state.coreData, id: action.payload.id },
        appStatus: APP_STATUS.READY,
        processing: { state: false, msg: null }
      };
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
    case ACTION_TYPES.CANCEL_COMPOSE:
      return { ...state, error: {} };
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
    case `${ACTION_TYPES.CREATE_ACCOUNT_RESET}_LOADING`:
      return initialState;
      break;
    case `${ACTION_TYPES.CREATE_ACCOUNT}_LOADING`:
      return { ...state, processing: { state: true, msg: 'Creating email ID...' } };
      break;
    case `${ACTION_TYPES.CREATE_ACCOUNT}_ERROR`:
      return { ...state, error: action.payload };
      break;
    case `${ACTION_TYPES.CREATE_ACCOUNT}_SUCCESS`:
      if (action.payload.newAccount) {
        return { ...state,
          newAccount: action.payload.newAccount,
          accStatus: ACC_STATUS.CREATED,
          processing: { state: false, msg: null }
        };
      }

      return { ...state,
        accStatus: ACC_STATUS.AUTHORISING,
        serviceToRegister: action.payload,
        processing: { state: false, msg: null }
      };
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
      return { ...state,
              processing: { state: false, msg: null },
              error: action.payload
      };
      break;
    default:
      return state;
      break;
  }
};

export default mail;
