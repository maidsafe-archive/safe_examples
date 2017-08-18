import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { ipcRenderer as ipc, remote, shell } from 'electron';
import routes from './routes';
import configureStore from './store/configureStore';
import { receiveResponse, onAuthFailure } from "./actions/initializer_actions";
const { Menu, MenuItem } = remote;
const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);

let menu = Menu.getApplicationMenu();
menu.items[4].submenu.append(new MenuItem({ label: 'Error Logs', click() {
  const state = store.getState();
  state.initializer.app.logPath()
  .then((path) => {
    console.log('Log file located at: ', path);
    shell.openExternal(path);
  })
} }))

ipc.on('auth-response', (event, response) => {
  if (response && response.indexOf('safe-') == 0) {
    store.dispatch(receiveResponse(response)); // TODO do it concurrently (no to linked dispatch)
  } else {
    store.dispatch(onAuthFailure(new Error('Authorisation failed')));
  }
});

export default class App extends React.Component {
  render() {
    return (<Provider store={store}>
			    <Router history={history} routes={routes(store)} />
			  </Provider>);
	}
}
