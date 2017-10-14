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
    this.readEmailIds = this.readEmailIds.bind(this);
  }

  componentDidMount() {
    const { setInitialiserTask, authoriseApplication } = this.props;
    setInitialiserTask(MESSAGES.INITIALISE.AUTHORISE_APP);

    return authoriseApplication();
  }

  readEmailIds() {
    const { setInitialiserTask, getEmailIds } = this.props;
    setInitialiserTask(MESSAGES.INITIALISE.FETCH_EMAIL_IDS);

    return getEmailIds()
        .then((_) => this.context.router.push('/create_account'));
  }

  componentDidUpdate(prevProps, prevState) {
    const { appStatus, app } = this.props;
    if (prevProps.appStatus === APP_STATUS.AUTHORISING
        && (appStatus === APP_STATUS.AUTHORISATION_DENIED
            || appStatus === APP_STATUS.AUTHORISATION_FAILED) ) {
      showAuthError(appStatus);
    } else if (app && appStatus === APP_STATUS.AUTHORISED) {
      return this.readEmailIds();
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
