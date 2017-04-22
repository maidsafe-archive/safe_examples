import ACTION_TYPES from './actionTypes';
import { authApp, connect, readConfig, writeConfig, readEmails } from '../safenet_comm';

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

    return connect(uri)
        .then(actionResolver)
        .catch(actionRejecter);
  }
};

export const authoriseApplication = () => {

  return function (dispatch) {
    dispatch({
      type: ACTION_TYPES.AUTHORISE_APP,
      payload: actionPromise()
    });

    return authApp()
        .then(actionResolver)
        .catch(actionRejecter);
  };
};

export const refreshConfig = () => {

  return function (dispatch, getState) {
    dispatch({
      type: ACTION_TYPES.GET_CONFIG,
      payload: actionPromise()
    });

    let app = getState().initializer.app;
    return readConfig(app)
        .then(actionResolver)
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
    return writeConfig(app, account)
        .then(actionResolver)
        .catch(actionRejecter);
  };
};

export const refreshEmail = (account) => {

  return function (dispatch, getState) {
    dispatch({
      type: ACTION_TYPES.REFRESH_EMAIL,
      payload: actionPromise()
    });

    let app = getState().initializer.app;

    const crypto = require('crypto');
/*
{
  const testXorName = crypto.randomBytes(32);
   app.mutableData.newPublic(testXorName, 15009)
    .then((md) => md.quickSetup({key1: "test"})
    .then((_) => app.mutableData.newMutation()
      .then((mut) => mut.remove('key1', 1)
        .then(() => md.applyEntriesMutation(mut))
        .then(() => console.log("MUTATED"))
      ))
    )
  .then(() => app.mutableData.newPublic(testXorName, 15009))
  .then((md) => md.getEntries())
  .then((entries) => entries.forEach((key, value) => {
      console.log("RETRIEVED", value.toString())
  }));

}
*/
/*
{
  const testXorName = crypto.randomBytes(32);
   app.mutableData.newPrivate(testXorName, 15009)
    .then((md) => md.quickSetup({key1: "test"})
    .then((_) => app.mutableData.newMutation()
      .then((mut) => mut.insert('key2', 'value2')
        .then(() => md.applyEntriesMutation(mut))
        .then(() => console.log("MUTATED"))
      ))
    )
  .then(() => app.mutableData.newPrivate(testXorName, 15009))
  .then((md) => md.getEntries())
  .then((entries) => md.encryptKey('key1').then((key) => entries.get('key1')))
  .then((vlue) => {
      console.log("RETRIEVED", value.buf.toString())
  });

}
*/
/*
{
  app.auth.refreshContainerAccess().then(() =>
      app.auth.getHomeContainer()
        .then((md) => md.getEntries()
          .then((entries) => entries.mutate()
            .then((mut) => mut.insert('key1', 'value1')
              .then(() => md.applyEntriesMutation(mut))
            )))
        .then(() => app.auth.getHomeContainer())
          .then((md) => md.encryptKey('key1').then((key) => md.get(key)))
          .then((value) => {
            console.log("RETRIEVED", value.buf.toString())
          })
  );
}
*/
    return readEmails(app, account.inbox_md, account,
            (inboxEntry) => {
              dispatch({
                type: ACTION_TYPES.PUSH_TO_INBOX,
                payload: inboxEntry
              });
        })
        .then(() => readEmails(app, account.archive_md, account,
            (archiveEntry) => {
              dispatch({
                type: ACTION_TYPES.PUSH_TO_ARCHIVE,
                payload: archiveEntry
              });
        }))
        .then((_) => actionResolver())
        .catch(actionRejecter);
  };
};
