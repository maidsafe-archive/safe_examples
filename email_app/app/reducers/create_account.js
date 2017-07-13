import ACTION_TYPES from '../actions/actionTypes';

const initialState = {
  error: {},
  newAccount: null
};

const createAccount = (state = initialState, action) => {
  switch (action.type) {
    case `${ACTION_TYPES.CREATE_ACCOUNT}_ERROR`:
      return { ...state, error: action.payload };
      break;
    case `${ACTION_TYPES.CREATE_ACCOUNT}_SUCCESS`:
      return { ...state, newAccount: action.payload };
      break;
    case `${ACTION_TYPES.STORE_NEW_ACCOUNT}_ERROR`:
      return { ...state, error: action.payload };
      break;
    default:
      return state;
  }
};

export default createAccount;
