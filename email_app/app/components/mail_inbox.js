import React, { Component } from 'react';
import MailList from './mail_list';
import { showError } from '../utils/app_utils';
import { CONSTANTS } from '../constants';

export default class MailInbox extends Component {
  constructor() {
    super();
    this.fetchMails = this.fetchMails.bind(this);
  }

  componentDidMount() {
    this.fetchMails();
  }

  fetchMails(e) {
    if (e) {
      e.preventDefault();
    }

    const { refreshEmail, accounts } = this.props;
    // TODO: Eventually the app can allow to choose which email account,
    //       it now supports only one.
    let chosenAccount = accounts;
    refreshEmail(chosenAccount)
        .catch((error) => {
          console.error('Failed fetching emails: ', error);
          showError('Failed fetching emails: ', error);
        });
  }

  render() {
    return (
      <div className="mail-list">
        <div className="mail-list-head">
          <div className="stats">
            Inbox Space Used: <span className="highlight">{this.props.inboxSize}KB of {CONSTANTS.TOTAL_INBOX_SIZE}KB  </span>
          </div>
          <div className="options text-right">
            <button className="mdl-button mdl-js-button mdl-button--icon" title="Fetch emails" onClick={this.fetchMails}>
              <i className="material-icons">refresh</i>
            </button>
          </div>
        </div>
        <MailList {...this.props} inbox={this} />
      </div>
    );
  }
}
