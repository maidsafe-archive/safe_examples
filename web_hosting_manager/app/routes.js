/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/app';
import AuthorisationPage from './containers/authorisation';
import InitialisePage from './containers/initialiser';
import PublicNamesPage from './containers/public_names';
import NewPublicNamePage from './containers/new_public_name';
import ChooseExistingContainerPage from './containers/choose_existing_container';
import CreateServiceContainerPage from './containers/create_service_container';
import CreateServicePage from './containers/create_service';
import WithTemplatePage from './containers/with_template';
import ManageFilesPage from './containers/manage_files';
import NewWebSitePage from './containers/new_web_site';
import RemapPage from './containers/remap';

export default () => (
  <App>
    <Switch>
      <Route path="/remap/:publicName/:service/:containerPath" component={RemapPage} />
      <Route
        path="/manageFiles/:publicName/:serviceName/:containerPath"
        component={ManageFilesPage}
      />
      <Route path="/withTemplate/:publicName/:serviceName" component={WithTemplatePage} />
      <Route
        path="/createServiceContainer/:publicName/:serviceName"
        component={CreateServiceContainerPage}
      />
      <Route path="/createService/:option/:publicName" component={CreateServicePage} />
      <Route
        path="/chooseExistingContainer/:publicName/:serviceName"
        component={ChooseExistingContainerPage}
      />
      <Route path="/newWebSite/:publicName" component={NewWebSitePage} />
      <Route path="/newPublicName" component={NewPublicNamePage} />
      <Route path="/publicNames" component={PublicNamesPage} />
      <Route path="/initialise" component={InitialisePage} />
      <Route path="/" component={AuthorisationPage} />
    </Switch>
  </App>
);
