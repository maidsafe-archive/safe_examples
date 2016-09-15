import React, { Component, PropTypes } from 'react';
import MailList from './mail_list';

export default class MailOutbox extends Component {
  render() {
    return (
      <div className="mail-list">
        <MailList {...this.props} outbox/>
      </div>
    );
  }
}
