// @flow

import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { i18nReducer } from 'react-redux-i18n';

import accessInfo from './access_info';
import auth from './auth';
import connection from './connection';
import publicId from './public_id';
import service from './service';
import containers from './containers';
import file from './file';

const rootReducer = combineReducers({
  accessInfo,
  auth,
  connection,
  containers,
  file,
  i18n: i18nReducer,
  publicId,
  routing,
  service
});

export default rootReducer;
