import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { ipcRenderer as ipc } from 'electron';
import routes from './routes';
import configureStore from './store/configureStore';
import { receiveResponse } from "./actions/initializer_actions";

const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);


const listenForAuthReponse = (event, response) => {
  // TODO parse response
  if (response) {
    store.dispatch(receiveResponse(response)); // TODO do it concurrently (no to linked dispatch)
  } else {
    // store.dispatch(onAuthFailure(new Error('Authorisation failed')));
  }
};

ipc.on('auth-response', listenForAuthReponse);


export default class App extends React.Component {
  render() {
    return (<Provider store={store}>
			    <Router history={history} routes={routes(store)} />
			  </Provider>);
	}
}