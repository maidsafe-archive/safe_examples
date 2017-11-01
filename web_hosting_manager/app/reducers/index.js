import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import authorisation from './authorisation';
import initialiser from './initialiser';
import publicNames from './public_names';
import fileManager from './file_manager';
import services from './services';

const rootReducer = combineReducers({
  authorisation,
  initialiser,
  publicNames,
  fileManager,
  services,
  router,
});

export default rootReducer;
