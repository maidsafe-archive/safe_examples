import ACTION_TYPES from '../../actions/actionTypes';
import { ACC_STATUS, SAFE_APP_ERROR_CODES, APP_STATUS } from '../../constants';

const initialState = {
  accStatus: null,
  error: {},
  coreData: {
    id: '',
    inbox: [],
    saved: []
  },
  emailIds: [],
  account: [],
  newAccount: null,
  serviceToRegister: null,
  processing: {
    state: false,
    msg: null
  },
};

const createAccount = (state = initialState, action) => {
  switch (action.type) {
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
  }
};

export default createAccount;
