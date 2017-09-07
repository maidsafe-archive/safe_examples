import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dateformat from 'dateformat';
import { showError } from '../utils/app_utils';
import { CONSTANTS } from '../constants';

export default class MailList extends Component {
  constructor() {
    super();
    this.listColors = {};
    this.activeType = null;
    this.refreshEmail = this.refreshEmail.bind(this);
    this.handleDeleteFromInbox = this.handleDeleteFromInbox.bind(this);
    this.handleDeleteSaved = this.handleDeleteSaved.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleReply = this.handleReply.bind(this);
  }

  refreshEmail(account) {
    this.props.refreshEmail(account)
        .catch((error) => {
          console.error('Fetching emails failed: ', error);
          showError('Fetching emails failed: ', error);
        });
  }

  handleDeleteFromInbox(e) {
    e.preventDefault();
    const { account, deleteEmail, refreshEmail } = this.props;
    deleteEmail(account.inboxMd, e.target.dataset.index)
        .catch((error) => {
          console.error('Failed trying to delete email from inbox: ', error);
          showError('Failed trying to delete email from inbox: ', error);
        })
        .then(() => this.refreshEmail(account))
  }

  handleDeleteSaved(e) {
    e.preventDefault();
    const { account, deleteEmail, refreshEmail } = this.props;
    deleteEmail(account.archiveMd, e.target.dataset.index)
        .catch((error) => {
          console.error('Failed trying to delete saved email: ', error);
          showError('Failed trying to delete saved email: ', error);
        })
        .then(() => this.refreshEmail(account))
  }

  handleSave(e) {
    e.preventDefault();
    const { account, saveEmail, refreshEmail } = this.props;
    saveEmail(account, e.target.dataset.index)
        .catch((error) => {
          console.error('Failed trying to save the email: ', error);
          showError('Failed trying to save the email: ', error);
        })
        .then(() => this.refreshEmail(account))
  }

  handleReply(e) {
    e.preventDefault();
    let replyTo = e.target.dataset.from;
    let subject = e.target.dataset.subject;
    this.context.router.push(`/compose_mail?${replyTo}&${subject}`);
  }

  render() {
    const self = this;
    const { coreData, error, inboxSize, inbox, savedSize, saved } = this.props;
    let container = null;

    if (inbox) {
      this.activeType = CONSTANTS.HOME_TABS.INBOX;
      container = (
        <div>
          {
            inboxSize === 0 ? <li className="mdl-card" title="No data in inbox mutableData">Inbox empty</li> : coreData.inbox.map((email) => {
              if (!self.listColors.hasOwnProperty(email.from)) {
                self.listColors[email.from] = `bg-color-${Object.keys(self.listColors).length % 10}`
              }
              return (
                <li className="mdl-card" key={email.id}>
                  <div className="icon">
                    <span className={self.listColors[email.from]}>{email.from[0]}</span>
                  </div>
                  <div className="cntx">
                    <h3 className="from">{email.from}</h3>
                    <h4 className="date">{dateformat(new Date(email.time), CONSTANTS.DATE_FORMAT)}</h4>
                    <p className="subject">{email.subject}</p>
                    <p className="context">{email.body}</p>
                  </div>
                  <div className="opt">
                    <div className="opt-i">
                      <button className="mdl-button mdl-js-button mdl-button--icon" name="reply" onClick={this.handleReply}><i className="material-icons" data-from={email.from} data-subject={email.subject}>reply</i></button>
                    </div>
                    <div className="opt-i">
                      <button className="mdl-button mdl-js-button mdl-button--icon" name="save" onClick={this.handleSave}><i className="material-icons" data-index={email.id}>save</i></button>
                    </div>
                    <div className="opt-i">
                      <button className="mdl-button mdl-js-button mdl-button--icon" name="delete" onClick={this.handleDeleteFromInbox}><i className="material-icons" data-index={email.id}>delete</i></button>
                    </div>
                  </div>
                </li>
              )
            })
          }
        </div>
      );
    }
    if (saved) {
      this.activeType = CONSTANTS.HOME_TABS.SAVED;
      container = (
        <div>
          {
            savedSize === 0 ? <li className="mdl-card">Saved empty</li> : coreData.saved.map((email) => {
              if (!self.listColors.hasOwnProperty(email.from)) {
                self.listColors[email.from] = `bg-color-${Object.keys(self.listColors).length % 10}`
              }
               return (
                <li className="mdl-card" key={email.id}>
                  <div className="icon">
                    <span className={this.listColors[email.from]}>{email.from[0]}</span>
                  </div>
                  <div className="cntx">
                    <h3 className="from">{email.from}</h3>
                    <h4 className="date">{dateformat(new Date(email.time), CONSTANTS.DATE_FORMAT)}</h4>
                    <p className="subject">{email.subject}</p>
                    <p className="context">{email.body}</p>
                  </div>
                  <div className="opt">
                    <div className="opt-i">
                      <button className="mdl-button mdl-js-button mdl-button--icon" name="reply" onClick={this.handleReply}><i className="material-icons" data-from={email.from} data-subject={email.subject}>reply</i></button>
                    </div>
                    <div className="opt-i">
                      <button className="mdl-button mdl-js-button mdl-button--icon" name="delete" onClick={this.handleDeleteSaved}><i className="material-icons" data-index={email.id}>delete</i></button>
                    </div>
                  </div>
                </li>
              )
            })
          }
        </div>
      );
    }

    return (
      <ul className="mail-list-item mdl-list">
        {container}
      </ul>
    );
  }
}

MailList.contextTypes = {
  router: PropTypes.object.isRequired
};
