import * as Action from '../actions/app';
import { I18n } from 'react-redux-i18n';
import { trimErrorMsg } from '../utils/app_utils';

const initialState = {
  fetchingPublicContainers: false,
  fetchedPublicContainers: false,
  fetchingContainer: false,
  publicContainers: [],
  containerInfo: [],
  deleting: false,
  error: null
};

const containers = (state: Object = initialState, action: Object) => {
  switch (action.type) {
    case Action.RESET:
      state = {
        ...state,
        ...initialState
      };
      break;

    case `${Action.FETCH_PUBLIC_CONTAINERS}_PENDING`:
      state = {
        ...state,
        publicContainers: [],
        fetchingPublicContainers: true
      };
      break;

    case `${Action.FETCH_PUBLIC_CONTAINERS}_FULFILLED`:
      state = {
        ...state,
        fetchingPublicContainers: false,
        publicContainers: action.payload,
        fetchedPublicContainers: true
      };
      break;

    case `${Action.FETCH_PUBLIC_CONTAINERS}_REJECTED`:
      state = {
        ...state,
        fetchedPublicContainers: false,
        error: I18n.t('messages.fetchingPublicContainerFailed', { error: trimErrorMsg(action.payload.message) })
      };
      break;

    case `${Action.CREATE_CONTAINER_AND_SERVICE}_FULFILLED`:
      const copy = state.publicContainers.map((name) => { return name; });
      // copy.push(action.payload);
      let key = null;
      for (key of Object.keys(action.payload)) {
        let skey = null;
        for (skey of Object.keys(action.payload[key])) {
          const contName = action.payload[key][skey];
          if (copy.indexOf(contName) === -1) {
            copy.push(contName);
          }
        }
      }
      state = {
        ...state,
        publicContainers: copy
      };
      break;

    case `${Action.FETCH_CONTAINER}_PENDING`:
      state = {
        ...state,
        containerInfo: [],
        fetchingContainer: true
      };
      break;

    case `${Action.FETCH_CONTAINER}_FULFILLED`:
      state = {
        ...state,
        containerInfo: action.payload,
        fetchingContainer: false
      };
      break;

    case `${Action.FETCH_CONTAINER}_REJECTED`:
      state = {
        ...state,
        fetchingContainer: false,
        containerInfo: [],
        error: I18n.t('messages.fetchingContainerFailed', { error: trimErrorMsg(action.payload.message) })
      };
      break;

    case `${Action.DELETE}_PENDING`:
      state = {
        ...state,
        deleting: true
      };
      break;

    case `${Action.DELETE}_FULFILLED`:
      state = {
        ...state,
        containerInfo: action.payload,
        deleting: false
      };
      break;

    case `${Action.DELETE}_REJECTED`:
      state = {
        ...state,
        deleting: false,
        error: trimErrorMsg(action.payload.message)
      };
      break;
    case Action.CLEAR_NOTIFICATION:
      state = {
        ...state,
        error: undefined
      };
      break;
  }
  return state;
};

export default containers;
