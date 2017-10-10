import lodash from 'lodash';
import actionTypes from '../actions/action_types';

import CONSTANTS from '../constants';
import { parseErrorMsg } from '../utils/app';

const initState = {
  publicNames: {},
  serviceContainers: [],
  createdPublicName: false,
  ...CONSTANTS.UI.COMMON_STATE
};

export default function publicNamesList(state = initState, action) {
  switch (action.type) {
    case actionTypes.SET_PUBLIC_NAMES:
      return {
        ...state,
        publicNames: lodash.cloneDeep(action.data)
      };
    case actionTypes.SET_SERVICE_CONTAINERS:
      return {
        ...state,
        serviceContainers: lodash.cloneDeep(action.data)
      };

    case `${actionTypes.CREATE_PUBLIC_NAME}_PENDING`:
      return {
        ...state,
        processing: true,
        processDesc: CONSTANTS.UI.MSG.CREATING_PUBLIC_NAMES
      };
    case `${actionTypes.CREATE_PUBLIC_NAME}_FULFILLED`:
      return {
        ...state,
        processing: false,
        createdPublicName: true,
        processDesc: null
      };
    case `${actionTypes.CREATE_PUBLIC_NAME}_REJECTED`:
      return {
        ...state,
        processing: false,
        error: parseErrorMsg(action.payload)
      };

    case `${actionTypes.FETCH_SERVICE_CONTAINERS}_PENDING`:
      return {
        ...state,
        processing: true,
        processDesc: CONSTANTS.UI.MSG.FETCH_SERVICE_CONTAINERS
      };
    case `${actionTypes.FETCH_SERVICE_CONTAINERS}_FULFILLED`:
      return {
        ...state,
        processing: false,
        processDesc: null
      };
    case `${actionTypes.FETCH_SERVICE_CONTAINERS}_REJECTED`:
      return {
        ...state,
        processing: false,
        error: parseErrorMsg(action.payload)
      };

    case actionTypes.RESET:
      return {
        ...state,
        ...CONSTANTS.UI.COMMON_STATE,
        createdPublicName: false
      };
    default:
      return state;
  }
}
