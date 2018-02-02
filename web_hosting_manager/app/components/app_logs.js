import fs from 'fs';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import CONSTANTS from '../constants';
import pkg from '../package.json';

export default class AppLogs extends Component {
  constructor() {
    super();
    this.logPath = null;
    this.state = {
      loading: true,
      logMap: {},
      logData: [],
      error: ''
    };
  }
  componentDidMount() {
    this.setState({loading: true});
    this.props.getLogFilePath()
      .then(path => {
        this.logPath = path.value;
        this.setState({loading: false});
      })
      .catch(err => {
        this.setState({loading: false, error: err.message})
      }).then(() => {
        this.readLogFile();
      });
  }

  readLogFile() {
    const logMap = {};
    try {
      if (this.logPath) {
        const clientLibraryLogs = fs.readFileSync(this.logPath);
        Object.assign(logMap, { clientLibraryLogs: clientLibraryLogs.toString() });
      }
      const clientLogs = fs.readFileSync(`${process.cwd()}/${pkg.name}-client.log`);
      Object.assign(logMap, { clientLogs: clientLogs.toString().split('\r\n') });
      this.setState({loading: false, logMap: logMap});
    } catch(err) {
      this.setState({loading: false, error: err.message});
    }
  }

  getErrorContainer() {
    if (!this.state.error) {
      return null;
    }

    return (
      <div key={this.state.error} className="_error">
        <h4>{this.state.error}</h4>
        <button className="btn" onClick={() => this.setState({error: ''})}>Close</button>
      </div>
    );
  }

  renderLogs(logs) {
     return logs.map((log) => <div key={log}>{log}</div> )
  }

  getLogs() {
    return Object.keys(this.state.logMap).map((key) => {
        return (
          <div>
            <a key={key} onClick={() => this.setState({ logData: this.state.logMap[key] })} >
              {key}
            </a>
          </div>
        );
    });
  }

  getLogsContainer() {
    if (this.state.logData.length > 0) {
      return (
        <div className="_logs">
          {this.renderLogs(this.state.logData)}
        </div>
      );
    }
    if (this.state.loading) {
      return (<div className="_loading">Please wait. Fetching logs...</div>);
    }
    return (
      <div className="_logs">{this.getLogs()}</div>
    );
  }

  render() {
    return (
      <div className="app-logs">
        <h3 className="_title">App logs</h3>
        <div className="_opts">
          <div className="_opt left">
            <button className="btn" onClick={e => {
              e.preventDefault();
              if (this.state.logData.length > 0) {
                this.setState({ logData: [] }); 
              } else {
                this.props.history.go(-1);
              }
            }}>Back</button>
          </div>
          <div className="_opt right">
            <button className="btn" disabled={this.state.loading} onClick={e => {e.preventDefault(); this.readLogFile();}}>Refresh</button>
          </div>
        </div>
        {this.getErrorContainer()}
        {this.getLogsContainer()}
      </div>
    );
  }
}

AppLogs.propTypes = {
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
