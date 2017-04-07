import ACTION_TYPES from '../actions/actionTypes';
import { MESSAGES } from '../constants';

const initialState = {
  app: '',
  tasks: [],
  accounts: [],
  config: null,
  coreData: {
    id: '',
    inbox: [],
    saved: [],
    outbox: []
  },
  inboxSize: 0
};

const initializer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_INITIALIZER_TASK: {
      const tasks = state.tasks.slice();
      tasks.push(action.task);
      return { ...state, tasks };
      break;
    }
    case `${ACTION_TYPES.AUTHORISE_APP}_LOADING`: {
      const tasks = state.tasks.slice();
      tasks.push(MESSAGES.INITIALIZE.AUTHORISE_APP);
      return { ...state, tasks };
      break;
    }
    case `${ACTION_TYPES.AUTHORISE_APP}_SUCCESS`:
      return { ...state, app: action.payload };
      break;
    case `${ACTION_TYPES.GET_CONFIG}_LOADING`: {
      const tasks = state.tasks.slice();
      tasks.push(MESSAGES.INITIALIZE.CHECK_CONFIGURATION);
      return { ...state, tasks };
      break;
    }
    case `${ACTION_TYPES.GET_CONFIG}_SUCCESS`:
      return { ...state,
        accounts: action.payload,
        coreData: { ...state.coreData, id: action.payload.id }
      };
      break;
    case `${ACTION_TYPES.STORE_NEW_ACCOUNT}_SUCCESS`:
      return { ...state,
        accounts: action.payload,
        coreData: { ...state.coreData, id: action.payload.id }
      };
      break;
    case `${ACTION_TYPES.REFRESH_EMAIL}_LOADING`:
      return { ...state,
        coreData: { ...state.coreData, inbox: [] },
        inboxSize: 0
      };
      break;
    case `${ACTION_TYPES.REFRESH_EMAIL}_SUCCESS`:
      return { ...state,
        coreData: { ...state.coreData, inbox: action.payload },
        inboxSize: action.payload.length
      };
      break;
/*    case ACTION_TYPES.PUSH_TO_INBOX: {
      const inbox = state.coreData.inbox.slice();
      inbox.push(action.data);

      return {
        ...state,
        coreData: {
          ...state.coreData,
          inbox
        }
      };
      break;
    }
    }*/
    default:
      return state;
      break;
  }
};

export default initializer;
