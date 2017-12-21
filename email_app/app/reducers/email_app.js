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
  coreData: {
    id: '',
    inbox: [],
    saved: []
  }
};

const pushEmailSorted = (list, item) => {
  const index = list.findIndex((elem) => elem.time <= item.email.time);
  item.email.id = item.id;
  if (index < 0) {
    list.push(item.email);
  } else {
    list.splice(index, 0, item.email);
  }
  return list;
};

const mail = (state = initialState, action) => {
  switch (action.type) {
    case `${ACTION_TYPES.GET_CONFIG}_LOADING`:
      return { ...state,
        accStatus: APP_STATUS.READING_CONFIG,
        processing: { state: true, msg: 'Reading emails...' }
      };
    case `${ACTION_TYPES.GET_CONFIG}_SUCCESS`:
      return { ...state,
        account: action.payload,
        coreData: { ...state.coreData, id: action.payload.id },
        accStatus: APP_STATUS.READY,
        processing: { state: false, msg: null }
      };
    case `${ACTION_TYPES.REFRESH_EMAIL}_LOADING`:
      return { ...state,
        coreData: { ...state.coreData, inbox: [], saved: [] },
        inboxSize: 0,
        savedSize: 0,
        processing: { state: true, msg: 'Reading emails...' }
      };
    case `${ACTION_TYPES.REFRESH_EMAIL}_SUCCESS`:
      return { ...state,
        spaceUsed: action.payload,
        processing: { state: false, msg: null }
      };
    case `${ACTION_TYPES.REFRESH_EMAIL}_ERROR`:
      return { ...state, processing: { state: false, msg: null } };
    case `${ACTION_TYPES.MAIL_PROCESSING}_LOADING`:
      return { ...state, processing: { state: true, msg: action.msg } };
    case `${ACTION_TYPES.MAIL_PROCESSING}_SUCCESS`:
    case `${ACTION_TYPES.MAIL_PROCESSING}_ERROR`:
      return { ...state, processing: { state: false, msg: null } };
    case ACTION_TYPES.PUSH_TO_INBOX: {
      const inbox = state.coreData.inbox.slice();
      pushEmailSorted(inbox, action.payload);
      return { ...state,
        coreData: { ...state.coreData, inbox },
        inboxSize: inbox.length
      };
    }
    case ACTION_TYPES.PUSH_TO_ARCHIVE: {
      const saved = state.coreData.saved.slice();
      pushEmailSorted(saved, action.payload);
      return { ...state,
        coreData: { ...state.coreData, saved },
        savedSize: saved.length
      };
    }
    case ACTION_TYPES.CANCEL_COMPOSE:
      return { ...state, error: {} };
    case `${ACTION_TYPES.FETCH_EMAIL_IDS}_LOADING`:
      return { ...state, accStatus: APP_STATUS.FETCHING_EMAIL_IDS };
    case `${ACTION_TYPES.FETCH_EMAIL_IDS}_SUCCESS`:
      return { ...state, emailIds: action.payload };
    case `${ACTION_TYPES.CREATE_ACCOUNT_RESET}_LOADING`:
      return { ...state,
        accStatus: null,
        error: {},
        newAccount: null,
        serviceToRegister: null
      };
    case `${ACTION_TYPES.CREATE_ACCOUNT}_LOADING`:
      return { ...state, processing: { state: true, msg: 'Creating email ID...' } };
    case `${ACTION_TYPES.CREATE_ACCOUNT}_ERROR`:
      return { ...state, error: action.payload, processing: { state: false, msg: null } };
    case `${ACTION_TYPES.CREATE_ACCOUNT}_SUCCESS`:
      if (action.payload.newAccount) {
        return { ...state,
          newAccount: action.payload.newAccount,
          accStatus: ACC_STATUS.CREATED
        };
      }

      return { ...state,
        accStatus: ACC_STATUS.AUTHORISING,
        serviceToRegister: action.payload
      };
    case `${ACTION_TYPES.STORE_NEW_ACCOUNT}_LOADING`:
      return { ...state, processing: { state: true, msg: 'Storing email info...' } };
    case `${ACTION_TYPES.STORE_NEW_ACCOUNT}_SUCCESS`:
      return { ...state,
        account: action.payload,
        coreData: { ...state.coreData, id: action.payload.id },
        processing: { state: false, msg: null }
      };
    case `${ACTION_TYPES.STORE_NEW_ACCOUNT}_ERROR`:
      return { ...state, error: action.payload };
    case `${ACTION_TYPES.AUTHORISE_SHARE_MD}_ERROR`: {
      let status = ACC_STATUS.AUTHORISATION_FAILED;
      if (action.payload.code === SAFE_APP_ERROR_CODES.ERR_SHARE_MDATA_DENIED) {
        status = ACC_STATUS.AUTHORISATION_DENIED;
      }
      return { ...state,
        accStatus: status,
        serviceToRegister: null,
        error: action.payload
      };
    }
    case `${ACTION_TYPES.AUTHORISE_SHARE_MD}_SUCCESS`:
      return { ...state,
        accStatus: ACC_STATUS.CREATED,
        newAccount: action.payload,
        serviceToRegister: null
      };
    default:
      return state;
  }
};

export default mail;
