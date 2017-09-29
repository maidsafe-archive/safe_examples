import ACTION_TYPES from './actionTypes';
import { storeEmail, removeEmail, archiveEmail } from '../safenet_comm';

export const sendEmail = (email, to) => {
    return function (dispatch, getState) {
      let app = getState().initialiser.app;
      return dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        msg: 'Sending email...',
        payload: storeEmail(app, email, to)
      });
    };
};

export const saveEmail = (account, key) => {
    return function (dispatch, getState) {
      let app = getState().initialiser.app;
      return dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        msg: 'Saving email...',
        payload: archiveEmail(app, account, key)
      });
    };
};

export const deleteEmail = (container, key) => {
    return function (dispatch, getState) {
      let app = getState().initialiser.app;
      return dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        msg: 'Deleting email...',
        payload: removeEmail(app, container, key)
      });
    };
};

export const cancelCompose = _ => ({
  type: ACTION_TYPES.CANCEL_COMPOSE
});
