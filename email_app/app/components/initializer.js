import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { remote } from 'electron';
import { CONSTANTS, AUTH_STATUS, MESSAGES } from '../constants';

const showDialog = (title, message) => {
  remote.dialog.showMessageBox({
    type: 'error',
    buttons: ['Ok'],
    title,
    message
  }, _ => { remote.getCurrentWindow().close(); });
};

export default class Initializer extends Component {
  constructor() {
    super();
    this.checkConfiguration = this.checkConfiguration.bind(this);
    this.refreshConfig = this.refreshConfig.bind(this);
  }

  componentDidMount() {
    const { setInitializerTask, authoriseApplication } = this.props;
    setInitializerTask(MESSAGES.INITIALIZE.AUTHORISE_APP);

    authoriseApplication()
      .then((_) => this.checkConfiguration())
  }

  refreshConfig() {
    return this.props.refreshConfig()
        .then((_) => {
          if (Object.keys(this.props.accounts).length > 0) {
            return this.context.router.push('/home');
          } else {
            return this.context.router.push('/create_account');
          }
        })
        .catch((err) => {
          console.error(err)
          showDialog('Error fetching configuration', MESSAGES.CHECK_CONFIGURATION_ERROR);
        });
  }

  checkConfiguration() {
    const { auth_status, app } = this.props;
    if (!app) {
      if (auth_status === AUTH_STATUS.AUTHORISATION_FAILED) {
        throw new Error('Authorisation failed.');
      }
      return;
    }

    return this.refreshConfig();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.auth_status === AUTH_STATUS.AUTHORISED) {
      this.refreshConfig()
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
