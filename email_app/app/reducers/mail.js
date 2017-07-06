import ACTION_TYPES from '../actions/actionTypes';

const initialState = {
  error: {}
};

const mail = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.CANCEL_COMPOSE:
      return { ...state, error: Object.assign({}) };
      break;
    default:
      return state;
      break;
  }
};

export default mail;
