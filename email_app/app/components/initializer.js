import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import { generateStructredDataId } from '../utils/app_utils';
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
    this.writeConfigFile = this.writeConfigFile.bind(this);
    this.getStructuredDataHandle = this.getStructuredDataHandle.bind(this);
    this.getStructuredDataIdHandle = this.getStructuredDataIdHandle.bind(this);
    this.createStructuredData = this.createStructuredData.bind(this);
    this.fetchStructuredData = this.fetchStructuredData.bind(this);
  }

  componentDidMount() {
    const { authoriseApplication, setInitializerTask } = this.props;
    authoriseApplication(AUTH_PAYLOAD, {"_publicNames" : ["Insert"]})
      .then((app) => {
        console.log(app);
        setInitializerTask(MESSAGES.INITIALIZE.CHECK_CONFIGURATION);
        return this.getConfiguration();
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
        return this.getStructuredDataIdHandle(new Buffer(res.payload.data).toString());
      });
  }

  getStructuredDataIdHandle(name) {
    const { client, getStructuredDataIdHandle } = this.props;
    
    getStructuredDataIdHandle(client, name, CONSTANTS.TAG_TYPE.DEFAULT)
      .then((res) => {
        if (res.error) {
          return showDialog('Get Structure Data Handler Error', res.error.message);
        }
        return this.getStructuredDataHandle(res.payload.data.handleId);
      });
  }

  getStructuredDataHandle(handleId) {
    const { client, fetchStructuredDataHandle } = this.props;
    fetchStructuredDataHandle(client, handleId)
      .then(res => {
        if (res.error) {
          return showDialog('Get Structure Data Handler Error', res.error.message);
        }
        return this.fetchStructuredData(res.payload.data.handleId);
      });
  }

  fetchStructuredData(handleId) {
    const { client, fetchStructuredData } = this.props;
    fetchStructuredData(client, handleId)
      .then(res => {
        if (res.error) {
          return showDialog('Get Structure Data Error', res.error.message);
        }
        const emailId =  res.payload.data ? res.payload.data.id : null;
        if (!emailId) {
          return this.context.router.push('/create_account');
        }
        return this.context.router.push('/home');
      });
  }

  createStructuredData() {
    const { client, createStructuredData, putStructuredData, getCipherOptsHandle, deleteCipherOptsHandle, dropStructuredDataHandle, setInitializerTask } = this.props;
    this.createCoreCount++;
    const structuredDataId = generateStructredDataId();
    const data = {
      id: '',
      saved: [],
      outbox: []
    };

    const deleteCipherHandle = (handleId) => {
      deleteCipherOptsHandle(client, handleId)
        .then((res) => {
          if (res.error) {
            return showDialog('Delete Cipher Opts Handle Error', res.error.message);
          }
          console.warn('Deleted Cipher Opts Handle');
        });
    };

    const put = (handleId) => {
      putStructuredData(client, handleId)
        .then((res) => {
          if (res.error) {
            return showDialog('Put Structure Data Error', res.error.message);
          }
          this.writeConfigFile(structuredDataId);
        });
    };

    const create = (cipherOptsHandle) => {
      createStructuredData(client, structuredDataId, data, cipherOptsHandle)
        .then((res) => {
          if (res.error) {
            if (this.createCoreCount > 5) {
              return showDialog('Create Core Structure Error', 'Failed to create Core structure');
            }
            return this.createStructuredData();
          }
          setInitializerTask(MESSAGES.INITIALIZE.WRITE_CONFIG_FILE);
          deleteCipherHandle(cipherOptsHandle);
          put(res.payload.data.handleId);
        });
    };

    const getCipherHandle = () => {
      getCipherOptsHandle(client, CONSTANTS.ENCRYPTION.SYMMETRIC)
        .then((res) => {
          if (res.error) {
            return showDialog('Get Cipher Opts Handle Error', res.error.message);
          }
          return create(res.payload.data.handleId);
        });
    };

    getCipherHandle();
  }

  writeConfigFile(structuredDataId) {
    const { client, writeConfigFile } = this.props;
    writeConfigFile(client, structuredDataId)
      .then((res) => {
        if (res.error) {
          return showDialog('Write Configuration File Error', res.error.message);
        }
        return this.context.router.push('/create_account');
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
