import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import emailApp from './email_app';

const rootReducer = combineReducers({
  emailApp,
  routing
});

export default rootReducer;
