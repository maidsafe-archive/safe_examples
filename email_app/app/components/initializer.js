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
    this.readEmailIds = this.readEmailIds.bind(this);
  }

  componentDidMount() {
    const { setInitializerTask, authoriseApplication } = this.props;
    setInitializerTask(MESSAGES.INITIALIZE.AUTHORISE_APP);

    return authoriseApplication();
  }

  readEmailIds() {
    const { setInitializerTask, getEmailIds } = this.props;
    setInitializerTask(MESSAGES.INITIALIZE.FETCH_EMAIL_IDS);

    return getEmailIds()
        .then((_) => this.context.router.push('/create_account'));
  }

  componentDidUpdate(prevProps, prevState) {
    const { app_status, app } = this.props;
    if (prevProps.app_status === APP_STATUS.AUTHORISING
        && (app_status === APP_STATUS.AUTHORISATION_DENIED
            || app_status === APP_STATUS.AUTHORISATION_FAILED) ) {
      showAuthError(app_status);
    } else if (app && app_status === APP_STATUS.AUTHORISED) {
      return this.readEmailIds();
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
