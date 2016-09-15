import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { hashHistory } from 'react-router';
import axios from 'axios';
import axiosMiddleware from 'redux-axios-middleware';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers';
import { CONSTANTS } from '../constants';

const router = routerMiddleware(hashHistory);

const client = axios.create({
  baseURL: CONSTANTS.SERVER_URL,
  responseType: 'json'
});

const enhancer = applyMiddleware(thunk, router, axiosMiddleware(client));

export default function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer);
}
