import React, { Component, PropTypes } from 'react';
import MailList from './mail_list';
import * as base64 from 'urlsafe-base64';
import { showError, hashEmailId } from '../utils/app_utils';
import { CONSTANTS } from '../constants';

export default class MailInbox extends Component {
  constructor() {
    super();
    this.appendableDataHandle = 0;
    this.dataLength = 0;
    this.currentIndex = 0;
    this.refresh = this.refresh.bind(this);
    this.fetchMails = this.fetchMails.bind(this);
    this.fetchMail = this.fetchMail.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.fetchMails();
  }

  fetchMail(id) {

  }

  fetchMails() {
    const { refreshEmail, accounts } = this.props;
    console.log("maIL INBOX:", accounts);
    return refreshEmail(accounts[0])
        .then(() => console.log("YEAH"))
        .catch(() => console.log("ACA ES EL ERROR"));
  }

  refresh(e) {
    if (e) {
      e.preventDefault();
    }
    this.currentIndex = 0;
    this.dataLength = 0;
    this.fetchMails();
  }

  render() {
    return (
      <div className="mail-list">
        <div className="mail-list-head">
          <div className="stats">
            Inbox Space Used: <span className="highlight">{this.props.inboxSize}KB of {CONSTANTS.TOTAL_INBOX_SIZE}KB  </span>
          </div>
          <div className="options text-right">
            <button className="mdl-button mdl-js-button mdl-button--icon" title="Fetch appendable data" onClick={this.refresh}>
              <i className="material-icons">refresh</i>
            </button>
          </div>
        </div>
        <MailList {...this.props} inbox={this} />
      </div>
    );
  }
}
