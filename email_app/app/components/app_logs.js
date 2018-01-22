import fs from 'fs';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

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

  async componentWillMount() {
    try {
      await this.setState({ loading: true });
      const path = await this.props.getLogPath();
      this.logPath = path.value;
      await this.readLogFile();
      await this.setState({ loading: false });
    } catch (err) {
      return this.setState({ loading: false, error: err.message });
    }
  }

  getErrorContainer() {
    if (!this.state.error) {
      return null;
    }

    return (
      <div className="_error">
        <h4>{this.state.error}</h4>
        <button className="btn" onClick={() => this.setState({ error: '' })}>Close</button>
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

  readLogFile() {
    if (!this.logPath) {
      this.setState({ error: 'Log path not set' });
      return;
    }
    this.setState({ loading: false });
    try {
      const logData = fs.readFileSync(this.logPath);
      this.setState({ loading: false, logData: logData.toString() });
    } catch (err) {
      this.setState({ loading: false, error: err.message });
    }
  }

  render() {
    return (
      <div className="app-logs">
        <h3 className="_title">App logs</h3>
        <div className="_opts">
          <div className="_opt left">
            <button className="btn" onClick={e => { e.preventDefault(); this.context.router.go(-1); }}>Back</button>
          </div>
          <div className="_opt right">
            <button className="btn" disabled={this.state.loading} onClick={e => { e.preventDefault(); this.readLogFile(); }}>Refresh</button>
          </div>
        </div>
        {this.getErrorContainer()}
        {this.getLogsContainer()}
      </div>
    );
  }
}

AppLogs.contextTypes = {
  router: PropTypes.object.isRequired,
};

AppLogs.propTypes = {
  getLogPath: PropTypes.func.isRequired,
};
