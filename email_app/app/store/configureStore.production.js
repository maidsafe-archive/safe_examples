import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { hashHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers';
import { CONSTANTS } from '../constants';
import promiseMiddleware from 'redux-promise-middleware';

const router = routerMiddleware(hashHistory);

const enhancer = applyMiddleware(thunk, router,  promiseMiddleware({
    promiseTypeSuffixes: ['LOADING', 'SUCCESS', 'ERROR']
  }));

export default function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer);
}
