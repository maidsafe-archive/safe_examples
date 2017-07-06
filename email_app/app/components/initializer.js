import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { remote } from 'electron';
import { showError } from '../utils/app_utils';
import { MESSAGES, APP_STATUS } from '../constants';

const showAuthError = (app_status) => {
  let message = MESSAGES.AUTHORISATION_ERROR;
  if (app_status === APP_STATUS.AUTHORISATION_DENIED) {
    message = MESSAGES.AUTHORISATION_DENIED;
  }
  showError('Authorisation failed', message, _ => { remote.getCurrentWindow().close(); });
};

export default class Initializer extends Component {
  constructor() {
    super();
    this.refreshConfig = this.refreshConfig.bind(this);
  }

  componentDidMount() {
    const { setInitializerTask, authoriseApplication } = this.props;
    setInitializerTask(MESSAGES.INITIALIZE.AUTHORISE_APP);

    return authoriseApplication();
  }

  refreshConfig() {
    const { setInitializerTask, refreshConfig } = this.props;
    setInitializerTask(MESSAGES.INITIALIZE.CHECK_CONFIGURATION);

    return refreshConfig()
        .then((_) => {
          if (Object.keys(this.props.accounts).length > 0) {
            return this.context.router.push('/home');
          }
          showAuthError();
        })
        .catch((_) => {
          console.log("No email account found");
          return this.context.router.push('/create_account');
        });
  }

  componentDidUpdate(prevProps, prevState) {
    const { app_status, app } = this.props;
    if (prevProps.app_status === APP_STATUS.AUTHORISING
        && (app_status === APP_STATUS.AUTHORISATION_DENIED
            || app_status === APP_STATUS.AUTHORISATION_FAILED) ) {
      showAuthError(app_status);
    } else if (app && app_status === APP_STATUS.AUTHORISED) {
      return this.refreshConfig();
    }
  }

  render() {
    const { tasks } = this.props;

    return (
      <div className="initializer">
        <div className="initializer-b">
          <h3 className="heading-lg text-center">Initialising application</h3>
          <ul>
            {
              tasks.map((task, i) => {
                return <li key={i}>{task}</li>;
              })
            }
          </ul>
        </div>
      </div>
    );
  }
}

Initializer.contextTypes = {
  router: PropTypes.object.isRequired
};
