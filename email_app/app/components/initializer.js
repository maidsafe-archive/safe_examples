import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import { CONSTANTS, AUTH_PAYLOAD, MESSAGES } from '../constants';

const showDialog = (title, message) => {
  remote.dialog.showMessageBox({
    type: 'error',
    buttons: ['Ok'],
    title,
    message
  }, _ => { remote.getCurrentWindow().close(); });
};

export default class Initializer extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor() {
    super();
    this.checkConfiguration = this.checkConfiguration.bind(this);
  }

  componentDidMount() {
    let appPermissions = {_publicNames : ['Read', 'Insert']};
    let options = {own_container: true};
    this.props.authoriseApplication(AUTH_PAYLOAD, appPermissions, options)
      .then((_) => this.checkConfiguration())
      .catch((err) => {
        console.error(err)
        showDialog('Authorisation Error', MESSAGES.AUTHORISATION_ERROR);
      });
  }

  checkConfiguration() {
    const { app, refreshConfig } = this.props;
    if (!app) {
      throw new Error('Application client not found.');
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
