import ACTION_TYPES from './actionTypes';
import { refreshEmail } from './initializer_actions';
import { CONSTANTS } from '../constants';
import { hashPublicId, encrypt } from '../utils/app_utils';

var actionResolver;
var actionRejecter;
const actionPromise = () => new Promise((resolve, reject) => {
  actionResolver = resolve;
  actionRejecter = reject;
});
/*
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
*/
const storeEmail = (app, email, pk) => {
  const encryptedEmail = encrypt(JSON.stringify(email), pk);

  return app.immutableData.create()
    .then((email) => email.write(encryptedEmail)
      .then(() => email.close())
    );
}

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
      let app = getState().initializer.app;

      return app.mutableData.newPublic(address, CONSTANTS.TAG_TYPE_DNS)
          .then((md) => md.get(serviceName))
          .then((service) => app.mutableData.fromSerial(service.buf))
          .then((inbox_md) => inbox_md.get(CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY)
            .then((pk) => storeEmail(app, email, pk.buf.toString())
              .then((email_addr) => app.mutableData.newMutation()
                .then((mut) => {
                  let entry = encrypt(email_addr.buffer.toString('hex'), pk.buf.toString());
                  return mut.insert(entry, entry) //TODO: perhaps we can store additional info in the entry's value
                    .then(() => inbox_md.applyEntriesMutation(mut))
                })
              )))
          .then(() => dispatch(clearMailProcessing))
          .then(() => actionResolver())
          .catch(actionRejecter);
    };
};

export const archiveEmail = (account, key) => {

    return function (dispatch, getState) {
      dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        payload: actionPromise()
      });

      let app = getState().initializer.app;
      return account.inbox_md.get(key)
          .then((email) => app.mutableData.newMutation()
            .then((mut) => mut.insert(key, email.buf)
              .then(() => account.archive_md.applyEntriesMutation(mut))
            )
          )
          .then(() => app.mutableData.newMutation())
          .then((mut) => mut.remove(key, 1)
            // FIXME: this depends on a bug in client_libs
            //.then(() => account.inbox_md.applyEntriesMutation(mut))
          )
          .then(() => dispatch(clearMailProcessing))
          .then(() => actionResolver())
          .catch(actionRejecter);
    };
};

//FIXME: this should also work when deleting from archive
export const deleteEmail = (account, key) => {

    return function (dispatch, getState) {
      dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        payload: actionPromise()
      });

      let app = getState().initializer.app;
      return app.mutableData.newMutation()
          .then((mut) => mut.remove(key, 1)
            // FIXME: this depends on a bug in client_libs
            .then(() => account.inbox_md.applyEntriesMutation(mut))
          )
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
