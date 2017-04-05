import { initializeApp, fromAuthURI } from 'safe-app';

import ACTION_TYPES from './actionTypes';

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
              .then(app => actionResolver(app))
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

    let accounts = {};
    let app = getState().initializer.app;
    return app.auth.refreshContainerAccess()
        .then(() => app.auth.getHomeContainer())
        .then((mdata) => mdata.getEntries()
          .then((entries) => entries.forEach((name, valV) => {
              accounts[name.toString()] = valV.buf.toString();
            })
            .then(() => actionResolver(accounts))
          )
        ).catch(actionRejecter);
  };
};

export const storeNewAccount = (account) => {

  return function (dispatch) {
    dispatch({
      type: ACTION_TYPES.STORE_NEW_ACCOUNT,
      payload: actionPromise()
    });

    // FIXME: store private key for encryption in app's container mapped to emailId
    // FIXME: map this address to emailId in publicNames
    return account.md_inbox.getNameAndTag()
        .then((res) => actionResolver(account))
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
    let testemail = [
      {
        time: 1491341458652,
        from: "me",
        subject: "test",
        body: "test body",
      }
    ];

    return account.md_inbox.getNameAndTag()
        .then((res) => actionResolver(testemail))
        .catch(actionRejecter);
  };
};
