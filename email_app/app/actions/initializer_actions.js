
import { initializeApp, fromAuthURI } from 'safe-app';

import ACTION_TYPES from './actionTypes';


var authResolver;
var authRejecter;
const authPromise = new Promise((resolve, reject) => {
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

export const authoriseApplication = (appData, permissions) => {
  initializeApp(appData)
    .then((app) =>
      process.env.SAFE_FAKE_AUTH 
        ? app.auth.loginForTest(permissions)
            .then(authResolver)
        : app.auth.genAuthUri({})
            .then(resp => app.auth.openUri(resp.uri))
    ).catch(authRejecter)

  return {
    type: ACTION_TYPES.AUTHORISE_APP,
    payload: authPromise
  };
};

export const refreshConfig = (app) => {
  const accounts = {};
  return {
    type: ACTION_TYPES.REFRESH_EMAIL,
    payload: app.auth.getHomeContainer()
      .then((mdata) => mdata.getEntries()
        .then((entries) => entries.forEach((name, valV) => {
          accounts[name.toString()] = valV
        }))
        .then(() => accounts))
  }};


