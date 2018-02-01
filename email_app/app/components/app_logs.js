import fs from 'fs';
import React, { Component } from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
const pkg = require('../../package.json');

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
    this.props.getLogPath()
      .then(path => {
        this.logPath = path.value;
        this.readLogFiles();
        this.setState({loading: false});
      })
      .catch(err => this.setState({loading: false, error: err.message}));
  }

  readLogFiles() {
    if (!this.logPath) {
      this.setState({error: 'Log path not set'});
      return;
    }
    this.setState({loading: false});
    try {
      const nativeLogData = fs.readFileSync(this.logPath);
      const logMap = {};
      Object.assign(logMap, { nativeLogData: nativeLogData.toString() });
      const electronLogData = fs.readFileSync(`${process.cwd()}/${pkg.name}-nodejs.log`);
      Object.assign(logMap, { electronLogData: electronLogData.toString() });
      this.setState({ loading: false, logData: logMap });
    } catch (err) {
      this.setState({ loading: false, error: err.message });
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

  getLogs() {
    return Object.keys(this.state.logData).map((key) => {
      return (
        <div>
          <Link key={key} onClick={() => this.setState({ data: this.state.logData[key] })} >
            {key}
          </Link>
        </div>
      );
    });
  }

  getLogsContainer() {
    if (this.state.data) {
      return (
        <div className="_logs default">
	  {this.state.data}
	</div>
      );
    }
    if (this.state.loading) {
      return (<div className="_loading">Please wait. Fetching logs...</div>);
    }
    if (!this.state.logData || this.state.logData === 'null') {
      return (
        <div className="_logs default">No logs found</div>
      );
    }
    return (
      <div>
        {this.getLogs()}
      </div>
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
              if (this.state.data) {
                this.setState({ data: null });
              } else {
                this.context.router.go(-1);
              }
    }}>Back</button>
          </div>
          <div className="_opt right">
            <button className="btn" disabled={this.state.loading} onClick={e => {e.preventDefault(); this.readLogFiles();}}>Refresh</button>
          </div>
        </div>
        {this.getErrorContainer()}
        {this.getLogsContainer()}
      </div>
    );
  }
}

AppLogs.contextTypes = {
  router: PropTypes.object.isRequired
};
