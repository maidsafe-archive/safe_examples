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

let currentState = store.getState();

store.subscribe(() => {
  let newState = store.getState();
  if(currentState.initializer.logPath !== newState.initializer.logPath) {
    let menu = Menu.getApplicationMenu();
    menu.items.map((item) => {
      if (item.label == "Help") {
        item.submenu.append(new MenuItem({ label: 'Error Logs', click() {
          // shell.openExternal(newState.initializer.logPath);
          shell.openItem(newState.initializer.logPath);
        } }))
      }
    })
  }
  currentState = newState;
})

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
