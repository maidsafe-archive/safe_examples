import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import initialiser from './common_network/initialiser';
import createAccount from './app_specific/create_account';
import mail from './app_specific/mail';

const rootReducer = combineReducers({
  initialiser,
  createAccount,
  mail,
  routing
});

export default rootReducer;
