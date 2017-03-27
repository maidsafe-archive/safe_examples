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
  }

  componentDidMount() {
    const { authoriseApplication, setInitializerTask } = this.props;
    authoriseApplication(AUTH_PAYLOAD, {"_publicNames" : ["Insert"]})
      .then((res) => {
        const app = res.value;
        setInitializerTask(MESSAGES.INITIALIZE.CHECK_CONFIGURATION);
        return app.auth.refreshContainerAccess()
            .then(() => this.props.refreshConfig(app))
            // .then(() => setInitializerTask(MESSAGES.))
      })
      .catch((err) => {
        console.error(err)
        return showDialog('Authorisation Error', MESSAGES.AUTHORISATION_ERROR);
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
