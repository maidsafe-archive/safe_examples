import ACTION_TYPES from './actionTypes';
import { storeEmail, removeEmail, archiveEmail } from '../safenet_comm';

var actionResolver;
var actionRejecter;
const actionPromise = () => new Promise((resolve, reject) => {
  actionResolver = resolve;
  actionRejecter = reject;
});

export const sendEmail = (email, to) => {

    return function (dispatch, getState) {
      dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        payload: actionPromise()
      });

      let app = getState().initializer.app;
      return storeEmail(app, email, to)
          .then(() => dispatch(clearMailProcessing))
          .then(() => actionResolver())
          .catch(actionRejecter);
    };
};

export const saveEmail = (account, key) => {

    return function (dispatch, getState) {
      dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        payload: actionPromise()
      });

      let app = getState().initializer.app;
      return archiveEmail(app, account, key)
          .then(() => dispatch(clearMailProcessing))
          .then(() => actionResolver())
          .catch(actionRejecter);
    };
};

export const deleteEmail = (container, key) => {

    return function (dispatch, getState) {
      dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        payload: actionPromise()
      });

      let app = getState().initializer.app;
      return removeEmail(app, container, key)
        .then(() => dispatch(clearMailProcessing))
        .then(() => actionResolver())
        .catch(actionRejecter);
    };
};

export const clearMailProcessing = _ => ({
  type: ACTION_TYPES.CLEAR_MAIL_PROCESSING
});

export const cancelCompose = () => ({
  type: ACTION_TYPES.CANCEL_COMPOSE
});
