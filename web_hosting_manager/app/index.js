// @flow

import React from 'react';
import { ipcRenderer as ipc, remote, shell } from 'electron';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { loadTranslations, setLocale, syncTranslationWithStore } from 'react-redux-i18n';


import { initTempFolder } from './lib/temp';
import routes from './routes';
import configureStore from './store/configureStore';
import loadLocale from './locales/loader';
import { connect, onAuthSuccess, onAuthFailure, clearAccessData } from './actions/app';
import './app.global.css';

const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);
const { Menu, MenuItem } = remote;

let locale = remote.app.getLocale();
let translationConfig = loadLocale(locale);
if (!translationConfig) {
  locale = 'en';
  translationConfig = loadLocale(locale);
}

let currentState = store.getState();

store.subscribe(() => {
  let newState = store.getState();
  if(currentState.auth.logPath !== newState.auth.logPath) {
    let menu = Menu.getApplicationMenu();
    menu.items.map((item) => {
      if (item.label == "Help") {
        item.submenu.append(new MenuItem({ label: 'Error Logs', click() {
          // shell.openExternal(newState.auth.logPath);
          shell.openItem(newState.auth.logPath);
        } }))
      }
    })
  }
  currentState = newState;
})

syncTranslationWithStore(store);
store.dispatch(loadTranslations(translationConfig));
store.dispatch(setLocale(locale));

initTempFolder();

const listenForAuthReponse = (event, response) => {
  if (response) {
    store.dispatch(onAuthSuccess());
    store.dispatch(connect(response));
  } else {
    store.dispatch(onAuthFailure(new Error('Authorisation failed')));
  }
};



ipc.on('auth-response', listenForAuthReponse);

ipc.on('clear-access-data', (event, res) => {
  if (res) {
    store.dispatch(clearAccessData());
  }
});

// disable drag and drop
window.document.addEventListener('drop', function(e) {
  e.preventDefault();
  e.stopPropagation();
});
window.document.addEventListener('dragover', function(e) {
  e.preventDefault();
  e.stopPropagation();
});


render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('root')
);
