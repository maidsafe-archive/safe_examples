import ACTION_TYPES from './actionTypes';
import { refreshEmail } from './initializer_actions';
import { CONSTANTS } from '../constants';
import { hashPublicId } from '../utils/app_utils';

var actionResolver;
var actionRejecter;
const actionPromise = () => new Promise((resolve, reject) => {
  actionResolver = resolve;
  actionRejecter = reject;
});

export const refreshInbox = (account) => {

    return function (dispatch, getState) {
      dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        payload: actionPromise()
      });

      return dispatch(refreshEmail(account))
          .then(() => dispatch(clearMailProcessing))
          .then(() => actionResolver)
          .catch(actionRejecter);
    };
};

export const sendEmail = (email, to) => {

    return function (dispatch, getState) {
      dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        payload: actionPromise()
      });

      // It supports complex email IDs, e.g. 'emailA.myshop', 'emailB.myshop'
      let toParts = to.split('.');
      const publicId = toParts.pop();
      const serviceName = toParts.join('.') + CONSTANTS.SERVICE_NAME_POSTFIX;
      const address = hashPublicId(publicId);
      const encryptedEmail = JSON.stringify(email);
      let app = getState().initializer.app;

      return app.mutableData.newPublic(address, CONSTANTS.TAG_TYPE_DNS)
          .then((md) => md.get(serviceName))
          .then((service) => app.mutableData.fromSerial(service.buf))
          .then((inbox_md) => inbox_md.getEntries()
            .then((entries) => entries.mutate())
            .then((mut) => mut.insert('email_3', encryptedEmail)
              .then(() => inbox_md.applyEntriesMutation(mut)) //FIXME: this fails due to dependency with bug MAID-2047
            ))
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
