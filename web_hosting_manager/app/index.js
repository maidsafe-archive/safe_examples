import { remote, ipcRenderer as ipc } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { loadTranslations, setLocale, syncTranslationWithStore } from 'react-redux-i18n';

import Root from './containers/root';
import { configureStore, history } from './store/configure_store';
import loadLocale from './locales/loader';
import { initTempFolder } from './safenet_comm/temp';

import { receiveResponse, simulateMockRes } from './actions/authorisation';
import './sass/index.sass';

const store = configureStore();

initTempFolder();

// setup i18n
let locale = remote.app.getLocale();
let translationConfig = loadLocale(locale);
if (!translationConfig) {
  locale = 'en';
  translationConfig = loadLocale(locale);
}
syncTranslationWithStore(store);
store.dispatch(loadTranslations(translationConfig));
store.dispatch(setLocale(locale));

// handle auth response
ipc.on('auth-response', (event, response) => {
  store.dispatch(receiveResponse(response));
});

ipc.on('simulate-mock-res', () => {
  store.dispatch(simulateMockRes());
});

ipc.on('show-log-file', () => {
  history.push('/appLogs');
});

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('App')
);

if (module.hot) {
  module.hot.accept('./containers/root', () => {
    const NextRoot = require('./containers/root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('App')
    );
  });
}
