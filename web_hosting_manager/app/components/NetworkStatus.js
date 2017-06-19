import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { I18n } from 'react-redux-i18n';

export default class NetworkStatus extends Component {
  render() {
    return (
      <div className="nw-status">
        <span
          className={classNames(
            'nw-status-i',
            {
              connecting: this.props.status !== 1,
              connected: this.props.status === 1
            }
          )}
        >{' '}</span>
        <span className="nw-status-tooltip">{this.props.message}</span>
      </div>
    );
  }
}

NetworkStatus.propTypes = {
  status: PropTypes.number.isRequired,
  message: PropTypes.string
};
