import ACTION_TYPES from '../../actions/actionTypes';
import { ACC_STATUS, SAFE_APP_ERROR_CODES } from '../../constants';

const initialState = {
  accStatus: null,
  error: {},
  account: [],
  newAccount: null,
  serviceToRegister: null
};

const createAccount = (state = initialState, action) => {
  switch (action.type) {
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
