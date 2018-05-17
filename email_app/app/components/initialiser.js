import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { remote } from 'electron';
import { showError } from '../utils/app_utils';
import { MESSAGES, APP_STATUS } from '../constants';

const showAuthError = (appStatus) => {
  let message = MESSAGES.AUTHORISATION_ERROR;
  if (appStatus === APP_STATUS.AUTHORISATION_DENIED) {
    message = MESSAGES.AUTHORISATION_DENIED;
  }
  showError('Authorisation failed', message, _ => { remote.getCurrentWindow().close(); });
};

export default class Initializer extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    const { setInitialiserTask, authoriseApplication, initialiseApplication } = this.props;
    if (!this.props.tasks[0]) {
      setInitialiserTask(MESSAGES.INITIALISE.AUTHORISE_APP);
    }
    if (!this.props.app) {
      initialiseApplication();
      authoriseApplication();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { appStatus } = this.props;
    if (prevProps.appStatus === APP_STATUS.AUTHORISING
        && (appStatus === APP_STATUS.AUTHORISATION_DENIED
            || appStatus === APP_STATUS.AUTHORISATION_FAILED) ) {
      showAuthError(appStatus);
    } else if (appStatus === APP_STATUS.CONNECTED) {
      this.context.router.push('/create_account');
    }
  }

  render() {
    const { tasks } = this.props;

    return (
      <div className="initialiser">
        <div className="initialiser-b">
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
