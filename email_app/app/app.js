import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { ipcRenderer as ipc } from 'electron';
import routes from './routes';
import configureStore from './store/configureStore';
import { receiveResponse, onAuthFailure } from "./actions/initialiser_actions";
const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);

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
