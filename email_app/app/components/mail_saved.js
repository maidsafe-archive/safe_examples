import React, { Component } from 'react';
import MailList from './mail_list';

export default class MailSaved extends Component {
  render() {
    return (
      <div className="mail-list">
        <MailList {...this.props} saved/>
      </div>
    );
  }
}
