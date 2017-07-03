import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { I18n } from 'react-redux-i18n';
import CONSTANTS from '../constants';

export default class NetworkStatus extends Component {
  render() {
    const { status, reconnect } = this.props;
    return (
      <div className="nw-status">
        { (status !== CONSTANTS.NETWORK_STATE.DISCONNECTED && status !== CONSTANTS.NETWORK_STATE.UNKNOWN) ? (
            <div className="nw-status-b">
              <span
                className={classNames(
                  'nw-status-i',
                  {
                    connecting: this.props.status === CONSTANTS.NETWORK_STATE.INIT,
                    connected: this.props.status === CONSTANTS.NETWORK_STATE.CONNECTED
                  }
                )}
              >{' '}</span>
              <span className="nw-status-tooltip">{this.props.message}</span>
            </div>
          ) : (
            <div className="reconnect">
              <button className="reconnect-btn" onClick={() => {
                reconnect();
              }}>{''}</button>
              <span className="nw-status-tooltip">Reconnect</span>
            </div>
          )}
      </div>
    );
  }
}

NetworkStatus.propTypes = {
  status: PropTypes.string.isRequired,
  message: PropTypes.string
};
