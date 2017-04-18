import { initializeApp, fromAuthURI } from 'safe-app';
import { shell } from 'electron';
import ACTION_TYPES from './actionTypes';
import { CONSTANTS } from '../constants';
import { hashPublicId, getAuthData, saveAuthData } from '../utils/app_utils';

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
      .then((app) => {
        saveAuthData(uri);
        return actionResolver(app);
      })
      .catch(actionRejecter)
  }
};

export const authoriseApplication = (appInfo, permissions, opts) => {

  return function (dispatch) {
    dispatch({
      type: ACTION_TYPES.AUTHORISE_APP,
      payload: actionPromise()
    });

    return initializeApp(appInfo)
      .then((app) => {
        if (process.env.SAFE_FAKE_AUTH) {
          return app.auth.loginForTest(permissions, opts)
              .then(actionResolver);
        } else {
/*          let authData = getAuthData();
          if (authData) {
            return actionResolver(authData);
          }*/
          return app.auth.genAuthUri(permissions, opts)
            .then((resp) => app.auth.openUri(resp.uri))
        }
      })
      .catch(actionRejecter);
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
        //.then(() => app.auth.getHomeContainer())
        .then(() => app.mutableData.newPublic(hashPublicId('home_container'), 15004)) //FIXME: use home container instead
        //.then((md) => md.encryptKey(CONSTANTS.MD_KEY_EMAIL_INBOX).then((key) => md.get(key))
        .then((md) => md.get(CONSTANTS.MD_KEY_EMAIL_INBOX)
          .then((value) => app.mutableData.fromSerial(value.buf))
          .then((inbox_md) => account.inbox_md = inbox_md)
//          .then(() => md.encryptKey(CONSTANTS.MD_KEY_EMAIL_ARCHIVE).then((key) => md.get(key)))
          .then(() => md.get(CONSTANTS.MD_KEY_EMAIL_ARCHIVE))
          .then((value) => app.mutableData.fromSerial(value.buf))
          .then((archive_md) => account.archive_md = archive_md)
//          .then(() => md.encryptKey(CONSTANTS.MD_KEY_EMAIL_ID).then((key) => md.get(key)))
          .then(() => md.get(CONSTANTS.MD_KEY_EMAIL_ID))
          .then((value) => account.id = value.buf.toString())
//          .then(() => md.encryptKey(CONSTANTS.MD_KEY_EMAIL_ENC_SECRET_KEY).then((key) => md.get(key)))
          .then(() => md.get(CONSTANTS.MD_KEY_EMAIL_ENC_SECRET_KEY))
          .then((value) => account.enc_sk = value.buf.toString())
        ).then((_) => {
          console.log("GOT ACCOUNT:", account);
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

    let serialised_inbox;
    let serialised_archive;
    let app = getState().initializer.app;
    return account.inbox_md.serialise()
        .then((serial) => serialised_inbox = serial)
        .then(() => account.archive_md.serialise())
        .then((serial) => serialised_archive = serial)
//        .then(() => app.auth.getHomeContainer())
        .then(() => app.mutableData.newPublic(hashPublicId('home_container'), 15004)) // FIXME: use home container instead
        .then((md) => {
          let account_data = {
            [CONSTANTS.MD_KEY_EMAIL_INBOX]: serialised_inbox,
            [CONSTANTS.MD_KEY_EMAIL_ARCHIVE]: serialised_archive,
            [CONSTANTS.MD_KEY_EMAIL_ID]: account.id,
            [CONSTANTS.MD_KEY_EMAIL_ENC_SECRET_KEY]: 'enc_sk' // FIXME: store private key (encrypted) for encryption of emails
          }

          return md.quickSetup(account_data)
        })
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
    let app = getState().initializer.app;

    return account.inbox_md.getEntries()
        .then((entries) => entries.forEach((key, value) => {
            if (key.toString() !== CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY) {
              app.immutableData.fetch(value.buf)
                .then((immData) => immData.read())
                .then((content) => {
                  console.log("EMAIL CONTENT", content)
                  let email = { [key.toString()]: JSON.parse(content.toString()) }
                  dispatch({
                    type: ACTION_TYPES.PUSH_TO_INBOX,
                    payload: email
                  });
                });
            }
          })
        )
        .then(() => account.archive_md.getEntries())
        .then((entries) => entries.forEach((key, value) => {
            app.immutableData.fetch(value.buf)
              .then((immData) => immData.read())
              .then((content) => {
                console.log("ARCHIVE CONTENT", content)
                let email = { [key.toString()]: JSON.parse(content.toString()) }
                dispatch({
                  type: ACTION_TYPES.PUSH_TO_ARCHIVE,
                  payload: email
                });
              });
          })
        )
        .then(() => actionResolver())
        .catch(actionRejecter);
  };
};
