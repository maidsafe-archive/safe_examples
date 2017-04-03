import ACTION_TYPES from '../actions/actionTypes';

const initialState = {
  processing: false,
  error: {}
};

const mail = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.MAIL_PROCESSING:
      return { ...state, processing: true };
      break;
    case ACTION_TYPES.CLEAR_MAIL_PROCESSING:
      return { ...state, processing: false };
      break;
    case ACTION_TYPES.CANCEL_COMPOSE:
      return { ...state, error: Object.assign({}) };
      break;
    default:
      return state;
      break;
  }
};

export default mail;
