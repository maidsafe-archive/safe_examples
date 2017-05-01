import ACTION_TYPES from './actionTypes';
import { storeEmail, removeInboxEmail, removeArchivedEmail, archiveEmail } from '../safenet_comm';

export const sendEmail = (email, to) => {
    return function (dispatch, getState) {
      let app = getState().initializer.app;
      return dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        payload: storeEmail(app, email, to)
            .then(() => dispatch(clearMailProcessing))
            .then(() => Promise.resolve())
      });
    };
};

export const saveEmail = (account, key) => {
    return function (dispatch, getState) {
      let app = getState().initializer.app;
      return dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        payload: archiveEmail(app, account, key)
            .then(() => dispatch(clearMailProcessing))
            .then(() => Promise.resolve())
      });
    };
};

export const deleteInboxEmail = (account, key) => {
    return function (dispatch, getState) {
      let app = getState().initializer.app;
      return dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        payload: removeInboxEmail(app, account, key)
          .then(() => dispatch(clearMailProcessing))
          .then(() => Promise.resolve())
      });
    };
};

export const deleteSavedEmail = (account, key) => {
    return function (dispatch, getState) {
      let app = getState().initializer.app;
      return dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        payload: removeArchivedEmail(app, account, key)
          .then(() => dispatch(clearMailProcessing))
          .then(() => Promise.resolve())
      });
    };
};

export const clearMailProcessing = _ => ({
  type: ACTION_TYPES.CLEAR_MAIL_PROCESSING
});

export const cancelCompose = _ => ({
  type: ACTION_TYPES.CANCEL_COMPOSE
});
