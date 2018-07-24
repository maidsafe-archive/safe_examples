import fs from 'fs';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CONSTANTS from '../constants';

export default class AppLogs extends Component {
  constructor() {
    super();
    this.logPath = null;
    this.state = {
      loading: true,
      logData: '',
      error: ''
    };
  }
  componentDidMount() {
    this.setState({loading: true});
    this.props.getLogFilePath()
      .then(path => {
        this.logPath = path.value;
        this.readLogFile();
        this.setState({loading: false});
      })
      .catch(err => this.setState({loading: false, error: err.message}));
  }

  readLogFile() {
    if (!this.logPath) {
      this.setState({error: 'Log path not set'});
      return;
    }
    this.setState({loading: false});
    try {
      const logData = fs.readFileSync(this.logPath);
      this.setState({loading: false, logData: logData.toString()});
    } catch(err) {
      this.setState({loading: false, error: err.message});
    }
  }

  getErrorContainer() {
    if (!this.state.error) {
      return null;
    }

    return (
      <div className="_error">
        <h4>{this.state.error}</h4>
        <button className="btn" onClick={() => this.setState({error: ''})}>Close</button>
      </div>
    );
  }

  getLogsContainer() {
    if (this.state.loading) {
      return (<div className="_loading">Please wait. Fetching logs...</div>);
    }
    if (!this.state.logData || this.state.logData === 'null') {
      return (
        <div className="_logs default">No logs found</div>
      );
    }
    return (
      <div className="_logs">{this.state.logData}</div>
    );
  }

  render() {
	const logPath = this.logPath | '';
    return (
      <div className="app-logs">
        <h3 className="_title">{`App Logs: ${logPath}`}</h3>
        <div className="_opts">
          <div className="_opt left">
            <button className="btn" onClick={e => {e.preventDefault(); this.props.history.go(-1);}}>Back</button>
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
