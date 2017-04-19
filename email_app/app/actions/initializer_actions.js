import { initializeApp, fromAuthURI } from 'safe-app';
import { shell } from 'electron';
import ACTION_TYPES from './actionTypes';
import { CONSTANTS, APP_INFO } from '../constants';
import { hashPublicId, getAuthData, saveAuthData, decrypt, clearAuthData } from '../utils/app_utils';

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

export const onAuthFailure = (err) => {
  return {
    type: ACTION_TYPES.AUTHORISE_APP,
    payload: actionRejecter(err)
  }
};

export const receiveResponse = (uri) => {
  return function (dispatch) {
    dispatch({
      type: ACTION_TYPES.AUTHORISE_APP,
      payload: actionPromise()
    });

    return fromAuthURI(APP_INFO.info, uri)
            .then((app) => {
              saveAuthData(uri);
              return actionResolver(app);
            })
            .catch(actionRejecter)
  }
};

export const authoriseApplication = () => {

  return function (dispatch) {
    dispatch({
      type: ACTION_TYPES.AUTHORISE_APP,
      payload: actionPromise()
    });

    return initializeApp(APP_INFO.info)
      .then((app) => {
        if (process.env.SAFE_FAKE_AUTH) {
          return app.auth.loginForTest(APP_INFO.permissions, APP_INFO.ops)
              .then(actionResolver);
        } else {
          let uri = getAuthData();
          if (uri) {
            return fromAuthURI(APP_INFO.info, uri)
              .then((app) => {
                return actionResolver(app);
              }, (err) => {
                console.warn("Auth URI stored is not valid anymore, it needs to be authorised again: ", err);
                clearAuthData();
                return app.auth.genAuthUri(APP_INFO.permissions, APP_INFO.ops)
                  .then((resp) => app.auth.openUri(resp.uri));
              })
              .catch(actionRejecter);
          }

          return app.auth.genAuthUri(APP_INFO.permissions, APP_INFO.ops)
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
//          .then(() => md.encryptKey(CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY).then((key) => md.get(key)))
          .then(() => md.get(CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY))
          .then((value) => account.enc_pk = value.buf.toString())
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
            [CONSTANTS.MD_KEY_EMAIL_ENC_SECRET_KEY]: account.enc_sk, // FIXME: make sure this is encrypted?
            [CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY]: account.enc_pk
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
              let entry_key = decrypt(key.toString(), account.enc_sk, account.enc_pk);

              return app.immutableData.fetch(Buffer.from(entry_key, 'hex'))
                .then((immData) => immData.read())
                .then((content) => {
                  let decryptedEmail;
                  try {
                    decryptedEmail = JSON.parse(decrypt(content.toString(), account.enc_sk, account.enc_pk));
                  } catch(err) {
                    return actionRejecter(err);
                  };

                  dispatch({
                    type: ACTION_TYPES.PUSH_TO_INBOX,
                    payload: { [entry_key]: decryptedEmail }
                  });
                })
            }
          })
        )
        .then(() => account.archive_md.getEntries())
        .then((entries) => entries.forEach((key, value) => {
            app.immutableData.fetch(value.buf)
              .then((immData) => immData.read())
              .then((content) => {
                let decryptedEmail;
                try {
                  decryptedEmail = JSON.parse(decrypt(content.toString(), account.enc_sk, account.enc_pk));
                } catch(err) {
                  return actionRejecter(err);
                };

                dispatch({
                  type: ACTION_TYPES.PUSH_TO_ARCHIVE,
                  payload: { [key.toString()]: decryptedEmail }
                });
              });
          })
        )
        .then(() => actionResolver())
        .catch(actionRejecter);
  };
};
