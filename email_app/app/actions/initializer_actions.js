import { initializeApp, fromAuthURI } from 'safe-app';

import ACTION_TYPES from './actionTypes';
import { CONSTANTS } from '../constants';
import { hashPublicId } from '../utils/app_utils';

var actionResolver;
var actionRejecter;
const actionPromise = () => new Promise((resolve, reject) => {
  actionResolver = resolve;
  actionRejecter = reject;
});

export const setInitializerTask = (task) => ({
  type: ACTION_TYPES.SET_INITIALIZER_TASK,
  task
});

export const receiveResponse = (uri) => {
  return {
    type: ACTION_TYPES.AUTHORISE_APP,
    payload: fromAuthURI(uri)
      .then((app) =>  actionResolver ? actionResolver(app) : app)
  }
};

export const authoriseApplication = (appInfo, permissions, opts) => {

  return function (dispatch) {
    dispatch({
      type: ACTION_TYPES.AUTHORISE_APP,
      payload: actionPromise()
    });

    return initializeApp(appInfo)
      .then((app) =>
        process.env.SAFE_FAKE_AUTH
          ? app.auth.loginForTest(permissions, opts)
              .then(actionResolver)
          : app.auth.genAuthUri(permissions, opts)
              .then(resp => app.auth.openUri(resp.uri))
      ).catch(actionRejecter);

  };
};

export const refreshConfig = () => {

  return function (dispatch, getState) {
    dispatch({
      type: ACTION_TYPES.GET_CONFIG,
      payload: actionPromise()
    });

    let account = {};
    let app = getState().initializer.app;
    return app.auth.refreshContainerAccess()
//        .then(() => app.auth.getHomeContainer())
        .then(() => app.mutableData.newPublic(hashPublicId('home_container'), 15004)) //FIXME: use home container instead
        .then((md) => md.get(CONSTANTS.MD_KEY_EMAIL_INBOX)
          .then((value) => app.mutableData.fromSerial(value.buf))
          .then((inbox_md) => account.inbox_md = inbox_md)
          .then(() => md.get(CONSTANTS.MD_KEY_EMAIL_ID))
          .then((value) => account.id = value.buf.toString())
          .then(() => md.get(CONSTANTS.MD_KEY_EMAIL_ENC_SECRET_KEY))
          .then((value) => account.enc_sk = value.buf.toString())
        ).then((_) => {
          console.log("GET ACCOUNT:", account);
          return actionResolver(account)
        })
        .catch(actionRejecter);
  };
};

export const storeNewAccount = (account) => {

  return function (dispatch, getState) {
    dispatch({
      type: ACTION_TYPES.STORE_NEW_ACCOUNT,
      payload: actionPromise()
    });

    let app = getState().initializer.app;
//    return app.auth.getHomeContainer()
    return app.mutableData.newPublic(hashPublicId('home_container'), 15004) // FIXME: use home container instead
        .then((md) => md.quickSetup())
        .then((md) => account.inbox_md.serialise()
          .then((serialised_md) => md.getEntries()
            .then((entries) => entries.mutate()
              .then((mut) => mut.insert(CONSTANTS.MD_KEY_EMAIL_INBOX, serialised_md)
                .then(() => mut.insert(CONSTANTS.MD_KEY_EMAIL_ID, account.id))
                // FIXME: store private key (encrypted) for encryption of emails
                .then(() => mut.insert(CONSTANTS.MD_KEY_EMAIL_ENC_SECRET_KEY, 'enc_sk'))
                .then(() => md.applyEntriesMutation(mut))
              ))))
        .then(() => {
          console.log("NEW ACCOUNT STORED:", account)
          return actionResolver(account)
        })
        .catch(actionRejecter);
  };
};

export const refreshEmail = (account) => {

  return function (dispatch, getState) {
    dispatch({
      type: ACTION_TYPES.REFRESH_EMAIL,
      payload: actionPromise()
    });

    console.log("REFRESHING EMAIL", account);
    let emails = [];
    return account.inbox_md.getEntries()
        .then((entries) => entries.forEach((key, value) => {
            if (key.toString() !== CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY) {
              let email = JSON.parse(value.buf.toString());
              // FIXME: decrypt the email
              emails.push(email);
            }
          }).then(() => actionResolver(emails))
        )
        .catch(actionRejecter);
  };
};
