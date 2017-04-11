import { initializeApp, fromAuthURI } from 'safe-app';
const electron = require('electron');

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
            .then(() => electron.ipcRenderer.on('auth-response', (event, response) => {
                console.log("AUTH RESPONSE RECEIVED");
                if (response) {
                  dispatch(receiveResponse(response));
                } else {
                  return actionRejecter(new Error('Authorisation failed'));
                }
              })
            )
            .then(() => setTimeout(() => {
              return actionRejecter(new Error('Authorisation failed due to a time out'));
            }, 5000));
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
//        .then(() => app.auth.getHomeContainer())
        .then(() => app.mutableData.newPublic(hashPublicId('home_container'), 15004)) //FIXME: use home container instead
        .then((md) => md.get(CONSTANTS.MD_KEY_EMAIL_INBOX)
          .then((value) => app.mutableData.fromSerial(value.buf))
          .then((inbox_md) => account.inbox_md = inbox_md)
          .then(() => md.get(CONSTANTS.MD_KEY_EMAIL_ARCHIVE))
          .then((value) => app.mutableData.fromSerial(value.buf))
          .then((archive_md) => account.archive_md = archive_md)
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

    let serialised_inbox;
    let serialised_archive;
    let app = getState().initializer.app;
    return account.inbox_md.serialise()
        .then((serial) => serialised_inbox = serial)
        .then(() => account.archive_md.serialise())
        .then((serial) => serialised_archive = serial)
        //    .then(() => app.auth.getHomeContainer()
        .then(() => app.mutableData.newPublic(hashPublicId('home_container'), 15004)) // FIXME: use home container instead
        .then((md) => md.quickSetup()
          .then((md) => md.getEntries()
            .then((entries) => entries.mutate()
              .then((mut) => mut.insert(CONSTANTS.MD_KEY_EMAIL_INBOX, serialised_inbox)
                .then(() => mut.insert(CONSTANTS.MD_KEY_EMAIL_ARCHIVE, serialised_archive))
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
    let app = getState().initializer.app;

    return account.inbox_md.getEntries()
        .then(() => account.inbox_md.getEntries())
        .then((entries) => entries.forEach((key, value) => {
            if (key.toString() !== CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY) {
              app.mutableData.newPublic(value.buf, 15006) //FIXME: remove it to use immutableData instead
                .then((email) => email.get("content"))
//              app.immutableData.fetch(value.buf)
//                .then((immData) => immData.read())
                .then((content) => {
                  console.log("CONTENT", content)
                  let email = { [key.toString()]: JSON.parse(content.buf.toString()) }
//                  let email = { [key.toString()]: JSON.parse(content.toString()) }
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
            console.log("CURRENT ARCHIVE:", key.toString())
            app.mutableData.newPublic(value.buf, 15006) //FIXME: remove it to use immutableData instead
              .then((email) => email.get("content"))
              .then((content) => {
                let email = { [key.toString()]: JSON.parse(content.buf.toString()) }
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
