// @flow
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './containers/App';
import AuthPage from './containers/AuthPage';
import HomePage from './containers/HomePage';
import CreateService from './containers/CreateService';
import FileExplorer from './containers/FileExplorer';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={AuthPage} />
    <Route path="home" component={HomePage}/>
    <Route path="service/:publicId" component={CreateService}/>
    <Route path="files/:service/:publicId/:containerPath" component={FileExplorer}/>
  </Route>
);
