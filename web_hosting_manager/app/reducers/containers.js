import * as Action from '../actions/app';
import { I18n } from 'react-redux-i18n';

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
        error: I18n.t('messages.fetchingPublicContainerFailed', { error: action.payload.message })
      };
      break;

    case `${Action.CREATE_CONTAINER_AND_SERVICE}_FULFILLED`:
      const copy = state.publicContainers.map((name) => { return name; });
      copy.push(action.payload);
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
        error: I18n.t('messages.fetchingContainerFailed', { error: action.payload.message })
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
        error: action.payload.message
      };
      break;
  }
  return state;
};

export default containers;
