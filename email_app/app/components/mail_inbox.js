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

    const { refreshEmail, account } = this.props;
    refreshEmail(account)
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
            Space used: <span className="highlight">{this.props.spaceUsed} of {CONSTANTS.TOTAL_AVAILABLE_SPACE}</span> (Note that deleted and saved emails still use space in the inbox)
          </div>
          <div className="options text-right">
            <button className="mdl-button mdl-js-button mdl-button--icon" {...this.props.processing.state && {'disabled' : 'disabled'} } title="Fetch emails" onClick={this.fetchMails}>
              <i className="material-icons">refresh</i>
            </button>
          </div>
        </div>
        <MailList {...this.props} inbox={this} />
      </div>
    );
  }
}
