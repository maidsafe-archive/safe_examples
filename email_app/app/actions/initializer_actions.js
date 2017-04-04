import { initializeApp, fromAuthURI } from 'safe-app';

import ACTION_TYPES from './actionTypes';

var authResolver;
var authRejecter;
const authPromise = () => new Promise((resolve, reject) => {
  authResolver = resolve;
  authRejecter = reject;
});

export const setInitializerTask = (task) => ({
  type: ACTION_TYPES.SET_INITIALIZER_TASK,
  task
});

export const receiveResponse = (uri) => {
  return {
    type: ACTION_TYPES.AUTHORISE_APP,
    payload: fromAuthURI(uri)
      .then((app) =>  authResolver ? authResolver(app) : app)
  }
};

export const authoriseApplication = (appInfo, permissions, opts) => {

  return function (dispatch) {
    dispatch({
      type: ACTION_TYPES.AUTHORISE_APP,
      payload: authPromise()
    });

    return initializeApp(appInfo)
      .then((app) =>
        process.env.SAFE_FAKE_AUTH
          ? app.auth.loginForTest(permissions, opts)
              .then(app => authResolver(app))
          : app.auth.genAuthUri(permissions, opts)
              .then(resp => app.auth.openUri(resp.uri))
      ).catch(authRejecter);

  };
};

export const refreshConfig = () => {

  return function (dispatch, getState) {
    dispatch({
      type: ACTION_TYPES.GET_CONFIG,
      payload: authPromise()
    });

    let accounts = {};
    let app = getState().initializer.app;
    return app.auth.refreshContainerAccess()
        .then(() => app.auth.getHomeContainer())
        .then((mdata) => mdata.getEntries()
          .then((entries) => entries.forEach((name, valV) => {
              accounts[name.toString()] = valV.buf.toString();
            })
            .then(() => authResolver(accounts))
          )
        ).catch(authRejecter);
  };
};

export const storeNewAccount = (account) => {

  return function (dispatch, getState) {
    dispatch({
      type: ACTION_TYPES.STORE_NEW_ACCOUNT,
      payload: authPromise()
    });

    let app = getState().initializer.app;
    // FIXME: store private key for encryption in app's container mapped to emailId
    // FIXME: map this address to emailId in publicNames
    return app.auth.refreshContainerAccess()
        .then(() => authResolver(account));
  };
};
