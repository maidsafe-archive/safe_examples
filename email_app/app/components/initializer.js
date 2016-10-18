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
    authoriseApplication(AUTH_PAYLOAD)
      .then(() => {
        setInitializerTask(MESSAGES.INITIALIZE.CHECK_CONFIGURATION);
        return this.getConfiguration();
      })
      .catch(() => {
        return showDialog('Authorisation Error', MESSAGES.AUTHORISATION_ERROR);
      });
  }

  getConfiguration() {
    const { token, getConfigFile, setInitializerTask } = this.props;
    if (!token) {
      throw new Error('Application token not found.');
    }

    getConfigFile(token)
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
    const { token, getStructuredDataIdHandle } = this.props;
    
    getStructuredDataIdHandle(token, name, CONSTANTS.TAG_TYPE.DEFAULT)
      .then((res) => {
        if (res.error) {
          return showDialog('Get Structure Data Handler Error', res.error.message);
        }
        return this.getStructuredDataHandle(res.payload.data.handleId);
      });
  }

  getStructuredDataHandle(handleId) {
    const { token, fetchStructuredDataHandle } = this.props;
    fetchStructuredDataHandle(token, handleId)
      .then(res => {
        if (res.error) {
          return showDialog('Get Structure Data Handler Error', res.error.message);
        }
        return this.fetchStructuredData(res.payload.data.handleId);
      });
  }

  fetchStructuredData(handleId) {
    const { token, fetchStructuredData } = this.props;
    fetchStructuredData(token, handleId)
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
    const { token, createStructuredData, putStructuredData, getCipherOptsHandle, deleteCipherOptsHandle, dropStructuredDataHandle, setInitializerTask } = this.props;
    this.createCoreCount++;
    const structuredDataId = generateStructredDataId();
    const data = {
      id: '',
      saved: [],
      outbox: []
    };

    const deleteCipherHandle = (handleId) => {
      deleteCipherOptsHandle(token, handleId)
        .then((res) => {
          if (res.error) {
            return showDialog('Delete Cipher Opts Handle Error', res.error.message);
          }
          console.warn('Deleted Cipher Opts Handle');
        });
    };

    const put = (handleId) => {
      putStructuredData(token, handleId)
        .then((res) => {
          if (res.error) {
            return showDialog('Put Structure Data Error', res.error.message);
          }
          this.writeConfigFile(structuredDataId);
        });
    };

    const create = (cipherOptsHandle) => {
      createStructuredData(token, structuredDataId, data, cipherOptsHandle)
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
      getCipherOptsHandle(token, CONSTANTS.ENCRYPTION.SYMMETRIC)
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
    const { token, writeConfigFile } = this.props;
    writeConfigFile(token, structuredDataId)
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
