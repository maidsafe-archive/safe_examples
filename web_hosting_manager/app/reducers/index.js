// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import authorisation from './authorisation';
import initialisation from './initialisation';
import publicNames from './public_names';
import fileManager from './file_manager';
import services from './services';

const rootReducer = combineReducers({
  authorisation,
  initialisation,
  publicNames,
  fileManager,
  services,
  router,
});

export default rootReducer;
