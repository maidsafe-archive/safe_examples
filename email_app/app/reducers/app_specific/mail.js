import ACTION_TYPES from '../../actions/actionTypes';
import { APP_STATUS } from '../../constants';

const initialState = {
  error: {},
  account: [],
  inboxSize: 0,
  savedSize: 0,
  spaceUsed: 0,
  processing: {
    state: false,
    msg: null
  },
  appStatus: null,
  coreData: {
    id: '',
    inbox: [],
    saved: []
  }
};

const pushEmailSorted = (list, item) => {
  let index = list.findIndex((elem) => {
    return elem.time <= item.email.time;
  });
  item.email.id = item.id;
  if (index < 0) {
    list.push(item.email);
  } else {
    list.splice(index, 0, item.email);
  }
  return list;
}

const mail = (state = initialState, action) => {
  switch (action.type) {
    case `${ACTION_TYPES.GET_CONFIG}_SUCCESS`:
      return { ...state,
        account: action.payload,
        coreData: { ...state.coreData, id: action.payload.id },
        appStatus: APP_STATUS.READY,
        processing: { state: false, msg: null }
      };
      break;
    case `${ACTION_TYPES.REFRESH_EMAIL}_LOADING`:
      return { ...state,
        coreData: { ...state.coreData, inbox: [], saved: [] },
        inboxSize: 0,
        savedSize: 0,
        processing: { state: true, msg: 'Reading emails...' }
      };
      break;
    case `${ACTION_TYPES.REFRESH_EMAIL}_SUCCESS`:
      return { ...state,
        spaceUsed: action.payload,
        processing: { state: false, msg: null }
      };
      break;
    case `${ACTION_TYPES.REFRESH_EMAIL}_ERROR`:
      return { ...state, processing: { state: false, msg: null } };
      break;
    case `${ACTION_TYPES.MAIL_PROCESSING}_LOADING`:
      return { ...state, processing: { state: true, msg: action.msg } };
      break;
    case `${ACTION_TYPES.MAIL_PROCESSING}_SUCCESS`:
    case `${ACTION_TYPES.MAIL_PROCESSING}_ERROR`:
      return { ...state, processing: { state: false, msg: null } };
      break;
    case ACTION_TYPES.PUSH_TO_INBOX: {
      let inbox = state.coreData.inbox.slice();
      pushEmailSorted(inbox, action.payload);
      return { ...state,
        coreData: { ...state.coreData, inbox },
        inboxSize: inbox.length
      };
      break;
    }
    case ACTION_TYPES.PUSH_TO_ARCHIVE: {
      let saved = state.coreData.saved.slice();
      pushEmailSorted(saved, action.payload);
      return { ...state,
        coreData: { ...state.coreData, saved },
        savedSize: saved.length
      };
      break;
    }
    case ACTION_TYPES.CANCEL_COMPOSE:
      return { ...state, error: {} };
      break;
    default:
      return state;
      break;
  }
};

export default mail;
