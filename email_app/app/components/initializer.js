import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import * as base64 from 'urlsafe-base64';
import pkg from '../../package.json';
import { MESSAGES } from '../constants';
import { hashEmailId, generateCoreStructreId } from '../utils/app_utils';

const AUTH_PAYLOAD = {
  app: {
    name: pkg.productName,
    vendor: pkg.author.name,
    version: pkg.version,
    id: pkg.identifier
  },
  permissions: ['LOW_LEVEL_API']
};

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
    this.checkConfiguration = this.checkConfiguration.bind(this);
    this.writeConfigFile = this.writeConfigFile.bind(this);
    this.getCoreStructureHandler = this.getCoreStructureHandler.bind(this);
    this.createCoreStructure = this.createCoreStructure.bind(this);
    this.fetchCoreStructure = this.fetchCoreStructure.bind(this);
  }

  componentDidMount() {
    const { authoriseApplication, setAuthorisedToken, setInitializerTask } = this.props;
    authoriseApplication(AUTH_PAYLOAD)
      .then(res => {
        setInitializerTask(MESSAGES.INITIALIZE.CHECK_CONFIGURATION);
        return this.checkConfiguration();
      })
      .catch(err => {
        return showDialog('Authorisation Error', MESSAGES.AUTHORISATION_ERROR);
      });
  }

  checkConfiguration() {
    const { token, getConfigFile, setInitializerTask } = this.props;
    if (!token) {
      throw new Error('Application token not found.');
    }

    getConfigFile(token)
      .then(res => {
        if (res.error) {
          setInitializerTask(MESSAGES.INITIALIZE.CREATE_CORE_STRUCTURE);
          return this.createCoreStructure();
        }
        setInitializerTask(MESSAGES.INITIALIZE.FETCH_CORE_STRUCTURE);
        const corehandlerId = new Buffer(res.payload.data).toString();
        return this.getCoreStructureHandler(corehandlerId);
      });
  }

  getCoreStructureHandler(coreId) {
    const { token, fetchCoreStructureHandler } = this.props;
    fetchCoreStructureHandler(token, coreId)
      .then(res => {
        if (res.error) {
          return showDialog('Get Structure Data Handler Error', res.error.message);
        }
        return this.fetchCoreStructure(res.payload.headers['handle-id']);
      });
  }

  fetchCoreStructure(handlerId) {
    const { token, fetchCoreStructure } = this.props;
    fetchCoreStructure(token, handlerId)
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

  createCoreStructure() {
    const { token, createCoreStructure, setInitializerTask } = this.props;
    this.createCoreCount++;
    const coreId = generateCoreStructreId();
    const data = {
      id: '',
      saved: [],
      outbox: []
    };
    createCoreStructure(token, coreId, data)
      .then((res) => {
        if (res.error) {
          if (this.createCoreCount > 5) {
            return showDialog('Create Core Structure Error', 'Failed to create Core structure');
          }
          return this.createCoreStructure();
        }
        setInitializerTask(MESSAGES.INITIALIZE.WRITE_CONFIG_FILE);
        this.writeConfigFile(coreId);
      });
  }

  writeConfigFile(coreId) {
    const { token, writeConfigFile } = this.props;
    writeConfigFile(token, coreId)
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
