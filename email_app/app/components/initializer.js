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
    this.createCoreCount = 0;
    this.getConfiguration = this.getConfiguration.bind(this);
  }

  componentDidMount() {
    const { authoriseApplication, setInitializerTask } = this.props;
    authoriseApplication(AUTH_PAYLOAD, {"_publicNames" : ["Insert"]})
      .then((app) => {
        console.log(app);
        setInitializerTask(MESSAGES.INITIALIZE.CHECK_CONFIGURATION);
        return app.auth.refreshContainerAccess().then(() => this.getConfiguration)
      })
      .catch((err) => {
        console.error(err)
        return showDialog('Authorisation Error', MESSAGES.AUTHORISATION_ERROR);
      });
  }

  getConfiguration() {
    const { client, getConfigFile, setInitializerTask } = this.props;
    if (!client) {
      throw new Error('Application client not found.');
    }

    getConfigFile(client)
      .then(res => {
        if (res.error) {
          setInitializerTask(MESSAGES.INITIALIZE.CREATE_CORE_STRUCTURE);
          return this.createStructuredData();
        }
        setInitializerTask(MESSAGES.INITIALIZE.FETCH_CORE_STRUCTURE);
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
