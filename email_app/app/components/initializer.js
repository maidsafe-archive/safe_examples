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
    this.props.authoriseApplication(AUTH_PAYLOAD, {"_publicNames" : ["Insert"]})
      .then((_) => this.checkConfiguration())
      .catch((err) => {
        console.error(err)
        return showDialog('Authorisation Error', MESSAGES.AUTHORISATION_ERROR);
      });
  }

  checkConfiguration() {
    const { client, refreshConfig } = this.props;
    if (!client) {
      throw new Error('Application client not found.');
    }

    return refreshConfig(client)
        .then((_) => {
          if (Object.keys(this.props.accounts).length > 0) {
            return this.context.router.push('/home');
          } else {
            return this.context.router.push('/create_account');
          }
        })
        .catch((err) => {
          console.error(err)
          return showDialog('Error fetching configuration', MESSAGES.CHECK_CONFIGURATION_ERROR);
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
