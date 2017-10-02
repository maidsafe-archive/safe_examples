import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import initialiser from './initialiser';
import emailApp from './email_app';

const rootReducer = combineReducers({
  initialiser,
  emailApp,
  routing
});

export default rootReducer;
