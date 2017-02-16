import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { I18n } from 'react-redux-i18n';

export default class NetworkStatus extends Component {
  static propTypes = {
    status: PropTypes.number.isRequired,
    message: PropTypes.string
  };

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
