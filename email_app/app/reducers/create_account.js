import ACTION_TYPES from '../actions/actionTypes';
import { ACC_STATUS, SAFE_APP_ERROR_CODES } from '../constants';

const initialState = {
  accStatus: null,
  error: {},
  newAccount: null,
  serviceToRegister: null
};

const createAccount = (state = initialState, action) => {
  switch (action.type) {
    case `${ACTION_TYPES.CREATE_ACCOUNT}_ERROR`:
      return { ...state, error: action.payload };
      break;
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
    case `${ACTION_TYPES.STORE_NEW_ACCOUNT}_ERROR`:
      return { ...state, error: action.payload };
      break;
    default:
      return state;
  }
};

export default createAccount;
