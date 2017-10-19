import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './containers/App';
import InitializerPage from './containers/initialiser_container';
import HomePage from './containers/home_container';
import InboxPage from './containers/mail_inbox_container';
import SavedPage from './containers/mail_saved_container';
import CreateAccountPage from './containers/create_account_container';
import ComposeMailPage from './containers/compose_mail_container';

let router = () => {
  return (
    <Route path="/" component={App}>
      <IndexRoute component={InitializerPage} />
      <Route path="/home" component={HomePage}>
        <IndexRoute component={InboxPage} />
        <Route path="/inbox" component={InboxPage} />
        <Route path="/saved" component={SavedPage} />
        <Route path="/compose_mail" component={ComposeMailPage} />
      </Route>
      <Route path="/create_account" component={CreateAccountPage} />
    </Route>
  );
};

export default router;
