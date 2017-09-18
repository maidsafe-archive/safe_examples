import ACTION_TYPES from '../actions/action_types';

import CONSTANTS from '../constants';
import { parseErrorMsg } from '../utils/app';

const initState = {
  checkedServiceExists: false,
  serviceExists: false,
  sendAuthReq: false,
  authorisingMD: false,
  ...CONSTANTS.UI.COMMON_STATE
};

export default function services(state = initState, action) {
  switch (action.type) {

    case `${ACTION_TYPES.CAN_ACCESS_PUBLIC_NAME}_PENDING`:
      return {
        ...state,
        processing: true,
        processDesc: CONSTANTS.UI.MSG.CHECK_PUB_ACCESS
      };
    case `${ACTION_TYPES.CAN_ACCESS_PUBLIC_NAME}_FULFILLED`:
      return {
        ...state,
        processing: false,
        processDesc: null,
        sendAuthReq: false
      };
    case `${ACTION_TYPES.CAN_ACCESS_PUBLIC_NAME}_REJECTED`:
      return {
        ...state,
        processing: false,
        processDesc: null,
        sendAuthReq: true
      };
    case `${ACTION_TYPES.CHECK_SERVICE_EXIST}_PENDING`:
      return {
        ...state,
        processing: true,
        processDesc: CONSTANTS.UI.MSG.CHECK_SERVICE_EXISTS
      };
    case `${ACTION_TYPES.CHECK_SERVICE_EXIST}_FULFILLED`:
      const serviceExists = !!action.payload;
      return {
        ...state,
        processing: false,
        serviceExists,
        checkedServiceExists: true,
        processDesc: null,
        error: serviceExists ? CONSTANTS.UI.MSG.SERVICE_EXISTS : null
      };
    case `${ACTION_TYPES.CHECK_SERVICE_EXIST}_REJECTED`:
      return {
        ...state,
        processing: false,
        error: parseErrorMsg(action.payload)
      };

    case `${ACTION_TYPES.DELETE_SERVICE}_PENDING`:
      return {
        ...state,
        processing: true,
        processDesc: CONSTANTS.UI.MSG.DELETING_SERVICE
      };
    case `${ACTION_TYPES.DELETE_SERVICE}_FULFILLED`:
      return {
        ...state,
        processing: false
      };
    case `${ACTION_TYPES.DELETE_SERVICE}_REJECTED`:
      return {
        ...state,
        processing: false,
        error: parseErrorMsg(action.payload)
      };

    case `${ACTION_TYPES.FETCH_SERVICES}_PENDING`:
      return {
        ...state,
        processing: true,
        processDesc: CONSTANTS.UI.MSG.FETCHING_SERVICE
      };
    case `${ACTION_TYPES.FETCH_SERVICES}_FULFILLED`:
      return {
        ...state,
        processing: false
      };
    case `${ACTION_TYPES.FETCH_SERVICES}_REJECTED`:
      return {
        ...state,
        processing: false,
        error: parseErrorMsg(action.payload)
      };
    case ACTION_TYPES.SEND_MD_REQ:
      return {
        sendAuthReq: false,
        authorisingMD: true,
        processing: true,
        processDesc: CONSTANTS.UI.MSG.MD_AUTH_WAITING
      };
    case `${ACTION_TYPES.MD_AUTHORISED}_FULFILLED`:
      return {
        authorisingMD: false,
        processing: false,
        processDesc: null
      };
    case `${ACTION_TYPES.MD_AUTHORISED}_REJECTED`:
      return {
        authorisingMD: false,
        processing: false,
        processDesc: null,
        error: parseErrorMsg(action.payload)
      };
    case ACTION_TYPES.CANCEL_MD_REQ:
      return {
        ...state,
        sendAuthReq: false
      };

    case ACTION_TYPES.RESET:
      return {
        ...state,
        ...CONSTANTS.UI.COMMON_STATE,
        checkedServiceExists: false,
        serviceExists: false
      };
    default:
      return state;
  }
}