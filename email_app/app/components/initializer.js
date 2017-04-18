import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { remote } from 'electron';
import { CONSTANTS, AUTH_STATUS, APP_INFO, MESSAGES } from '../constants';

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
  }

  componentDidMount() {
    this.props.authoriseApplication(APP_INFO.info, APP_INFO.permissions, APP_INFO.ops)
      .then((_) => this.checkConfiguration())
      .catch((err) => {
        console.error(err)
        showDialog('Authorisation Error', MESSAGES.AUTHORISATION_ERROR);
      });
  }

  checkConfiguration() {
    const { auth_status, app, refreshConfig } = this.props;
    if (!app) {
      if (auth_status !== AUTH_STATUS.AUTHORISING) {
        throw new Error('Authorisation failed.');
      }
      return;
    }

    refreshConfig()
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

  render() {
    //FIXME: check configuration when authorisation is in progress
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
