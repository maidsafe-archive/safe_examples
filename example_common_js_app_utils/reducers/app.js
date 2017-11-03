import ACTION_TYPES from '../actions/action_types';

const initialState = {
  publicNames: [],
  processing: {
    state: false,
    msg: ''
  },
  error: '',
};

const app = (state = initialState, action) => {
  switch (action.type) {
    case `${ACTION_TYPES.CREATE_PUBLIC_NAME}_LOADING`:
      return { ...state, processing: { state: true, msg: 'Creating public names' } };
      break;
    case `${ACTION_TYPES.CREATE_PUBLIC_NAME}_SUCCESS`:
      return { ...state, processing: { state: false, msg: '' } };
      break;
    case `${ACTION_TYPES.CREATE_PUBLIC_NAME}_ERROR`:
      return { ...state, processing: { state: false, msg: '' }, error: action.payload.message };
      break;

    case `${ACTION_TYPES.FETCH_PUBLIC_NAMES}_LOADING`:
      return { ...state, processing: { state: true, msg: 'Fetching public names' } };
      break;
    case `${ACTION_TYPES.FETCH_PUBLIC_NAMES}_SUCCESS`:
      return { ...state, processing: { state: false, msg: '' }, publicNames: action.payload.slice(0) };
      break;
    case `${ACTION_TYPES.FETCH_PUBLIC_NAMES}_ERROR`:
      return { ...state, processing: { state: false, msg: '' }, error: action.payload.message };
      break;
    default:
      return state;
      break;
  }
};

export default app;
