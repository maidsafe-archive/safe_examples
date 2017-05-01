import ACTION_TYPES from '../actions/actionTypes';

const initialState = {
  processing: false,
  error: {},
  newAccount: null
};

const createAccount = (state = initialState, action) => {
  switch (action.type) {
    case `${ACTION_TYPES.CREATE_ACCOUNT}_LOADING`:
      return { ...state, processing: true };
      break;
    case `${ACTION_TYPES.CREATE_ACCOUNT}_SUCCESS`: {
      return { ...state, processing: false, newAccount: action.payload };
      break;
    }
    case ACTION_TYPES.CREATE_ACCOUNT_ERROR:
      return { ...state, error: action.error, processing: false };
      break;
    default:
      return state;
  }
};

export default createAccount;
