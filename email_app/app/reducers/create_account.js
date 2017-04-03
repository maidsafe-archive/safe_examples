import ACTION_TYPES from '../actions/actionTypes';

const initialState = {
  processing: false,
  accounts: [],
  error: {}
};

const createAccount = (state = initialState, action) => {
  switch (action.type) {
    case `${ACTION_TYPES.CREATE_ACCOUNT}_LOADING`:
      return { ...state, processing: true };
      break;
    case `${ACTION_TYPES.CREATE_ACCOUNT}_SUCCESS`: {
      let updatedCoreData = { ...state.coreData, id: action.payload };
      let updatedAccounts = state.accounts.push(action.payload);
      return { ...state, coreData: updatedCoreData,
        accounts: updatedAccounts, processing: false };
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
