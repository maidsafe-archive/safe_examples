import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import initializer from './initialiser';
import createAccount from './create_account';
import mail from './mail';

const rootReducer = combineReducers({
  initializer,
  createAccount,
  mail,
  routing
});

export default rootReducer;
