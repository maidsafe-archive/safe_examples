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

const storeEmail = (app, email) => {
  const encryptedEmail = JSON.stringify(email); //FIXME: encrypt the content
  let a;
  let b;
  return app.immutableData.create()
    .then((email) => email.write(encryptedEmail)
      .then(() => email.close())
      .then((e) => a = e)
    )
    .then(() => app.mutableData.newPublic(hashPublicId("emailcontent"), 15006)
    .then((email) => email.quickSetup({content: encryptedEmail}))
    .then((email) => email.getNameAndTag())
    .then((e) => b = e.name)
    .then(() => b)) //FIXME: just create a immutableData

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
          .then((inbox_md) => storeEmail(app, email)
            .then((email_addr) => inbox_md.getEntries()
              .then((entries) => entries.mutate())
              .then((mut) => mut.insert(email_addr.buffer.toString('hex'), email_addr)
                .then(() => inbox_md.applyEntriesMutation(mut))
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

      return account.inbox_md.getEntries()
          .then((entries) => entries.get(key)
            .then((email) => account.archive_md.getEntries()
              .then((entries) => entries.mutate())
              .then((mut) => mut.insert(key, email.buf)
                .then(() => account.archive_md.applyEntriesMutation(mut))
              )
            )
            .then(() => entries.mutate())
            .then((mut) => mut.remove(key, 1)
              // FIXME: this depends on a bug in client_libs
              //.then(() => account.inbox_md.applyEntriesMutation(mut))
            )
          )
          .then(() => dispatch(clearMailProcessing))
          .then(() => actionResolver())
          .catch(actionRejecter);
    };
};

export const deleteEmail = (account, key) => {

    return function (dispatch, getState) {
      dispatch({
        type: ACTION_TYPES.MAIL_PROCESSING,
        payload: actionPromise()
      });

      return account.inbox_md.getEntries()
          .then((entries) => entries.mutate())
          .then((mut) => mut.remove(key, 1)
            // FIXME: this depends on a bug in client_libs
            //.then(() => account.inbox_md.applyEntriesMutation(mut))
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
