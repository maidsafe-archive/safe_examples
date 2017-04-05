import ACTION_TYPES from './actionTypes';
import { refreshEmail } from './initializer_actions';

var actionResolver;
var actionRejecter;
const actionPromise = new Promise((resolve, reject) => {
  actionResolver = resolve;
  actionRejecter = reject;
});

export const refreshInbox = (account) => {

    return function (dispatch, getState) {
      dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        payload: actionPromise
      });

      return dispatch(refreshEmail(account))
          .then(() => dispatch(clearMailProcessing))
          .then(() => actionResolver)
          .catch(actionRejecter);
    };
};

export const clearMailProcessing = _ => ({
  type: ACTION_TYPES.CLEAR_MAIL_PROCESSING
});

export const setActiveMail = (data) => ({
  type: ACTION_TYPES.SET_ACTIVE_MAIL,
  data
});

export const cancelCompose = () => ({
  type: ACTION_TYPES.CANCEL_COMPOSE
});
