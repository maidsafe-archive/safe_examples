import ACTION_TYPE from '../actions/action_types';

import { parseErrorMsg } from '../utils/app';

const initState = {
  connected: false,
  fetchedAccessInfo: false,
  fetchedPublicNames: false,
  fetchedPublicContainer: false,
  fetchedServices: false,
  loading: false,
  error: null
};

export default function authorisation(state = initState, action) {
  switch (action.type) {
    case `${ACTION_TYPE.INITIALISE_APP}_PENDING`:
      return {
        ...state,
        loading: true
      };
    case `${ACTION_TYPE.INITIALISE_APP}_FULFILLED`:
      return {
        ...state,
        loading: false
      };
    case `${ACTION_TYPE.INITIALISE_APP}_REJECTED`:
      return {
        ...state,
        loading: false,
        error: action.payload ? parseErrorMsg(action.payload) : action.error
      };
    case ACTION_TYPE.CONNECTED:
      return {
        ...state,
        connected: true,
      };
    case ACTION_TYPE.FETCHED_ACCESS_INFO:
      return {
        ...state,
        fetchedAccessInfo: true,
      };
    case ACTION_TYPE.FETCHED_PUBLIC_NAMES:
      return {
        ...state,
        fetchedPublicNames: true,
      };
    case ACTION_TYPE.FETCHED_PUBLIC_CONTAINER:
      return {
        ...state,
        fetchedPublicContainer: true,
      };
    case ACTION_TYPE.FETCHED_SERVICES:
      return {
        ...state,
        fetchedServices: true,
      };
    case ACTION_TYPE.RESET_INITIALISATION:
      return {
        ...state,
        ...initState
      };
    default:
      return state;
  }
}
