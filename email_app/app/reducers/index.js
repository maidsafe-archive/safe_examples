import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import emailApp from './email_app';
import initialiser from './initialiser';

const rootReducer = combineReducers({
  emailApp,
  initialiser,
  routing
});

export default rootReducer;
