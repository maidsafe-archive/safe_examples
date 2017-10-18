import { remote, ipcRenderer as ipc } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { loadTranslations, setLocale, syncTranslationWithStore } from 'react-redux-i18n';

import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import loadLocale from './locales/loader';
import { initTempFolder } from './lib/temp';

import { receiveResponse, simulateMockRes } from './actions/authorisation';

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

const renderApp = () => {
  render(
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('App'),
  );
};
renderApp();

if (module.hot) {
  module.hot.accept(renderApp);
}
