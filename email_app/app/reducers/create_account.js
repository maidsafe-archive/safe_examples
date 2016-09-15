import ACTION_TYPES from '../actions/actionTypes';

const initialState = {
  authorised: false,
  processing: false,
  error: {}
};

const createAccount = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_CREATE_ACCOUNT_PROCESSING: {
      return { ...state, processing: true };
    }
    case ACTION_TYPES.SET_CREATE_ACCOUNT_ERROR:
      return { ...state, error: action.error, processing: false };
      break;
    default:
      return state;
  }
};

export default createAccount;
