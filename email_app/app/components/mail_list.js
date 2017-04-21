import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { remote } from 'electron';
import dateformat from 'dateformat';
import { showError, showSuccess } from '../utils/app_utils';
import { CONSTANTS } from '../constants';

export default class MailList extends Component {
  constructor() {
    super();
    this.listColors = {};
    this.activeType = null;
    this.goBack = this.goBack.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.handleDeleteFromInbox = this.handleDeleteFromInbox.bind(this);
    this.handleDeleteSaved = this.handleDeleteSaved.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  goBack() {
    const { router } = this.context;

    switch (this.activeType) {
      case CONSTANTS.HOME_TABS.INBOX: {
        return this.props.refreshEmail();
      }
      case CONSTANTS.HOME_TABS.SAVED: {
        router.push('/home');
        return router.push('/saved');
      }
    }
  }

  deleteItem(container, index) {
    const { accounts, deleteEmail, refreshEmail } = this.props;
    deleteEmail(container, index)
        .catch((error) => {
          console.error(err);
          showError('Failed trying to delete email: ', error);
        })
        .then(() => refreshEmail(accounts))
        .catch((error) => {
          console.error(error);
          showError('Fetching emails failed: ', error);
        });
  }

  handleDeleteFromInbox(e) {
    e.preventDefault();
    this.deleteItem(this.props.accounts.inbox_md, e.target.dataset.index)
  }

  handleDeleteSaved(e) {
    e.preventDefault();
    this.deleteItem(this.props.accounts.archive_md, e.target.dataset.index)
  }

  handleSave(e) {
    e.preventDefault();
    const { accounts, saveEmail, refreshEmail } = this.props;
    // TODO: Eventually the app can allow to choose which email account,
    //       it now supports only one.
    let chosenAccount = accounts;
    saveEmail(chosenAccount, e.target.dataset.index)
        .catch((error) => {
          console.error(err);
          showError('Failed trying to save the email: ', error);
        })
        .then(() => refreshEmail(chosenAccount))
        .catch((error) => {
          console.error(error);
          showError('Fetching emails failed: ', error);
        });
  }

  render() {
    const self = this;
    const { processing, coreData, error, inboxSize, inbox, savedSize, saved } = this.props;
    let container = null;

    if (processing) {
      container = <li className="mdl-card">Loading...</li>
    } else if (Object.keys(error).length > 0) {
      container = <li className="error">Error in fetching emails!</li>
    } else {
      if (inbox) {
        this.activeType = CONSTANTS.HOME_TABS.INBOX;
        container = (
          <div>
            {
              inboxSize === 0 ? <li className="mdl-card" title="No data in inbox mutableData">Inbox empty</li> : Object.keys(coreData.inbox).map((key) => {
                let mail = coreData.inbox[key];
                if (!self.listColors.hasOwnProperty(mail.from)) {
                  self.listColors[mail.from] = `bg-color-${Object.keys(self.listColors).length % 10}`
                }
                return (
                  <li className="mdl-card" key={key}>
                    <div className="icon">
                      <span className={self.listColors[mail.from]}>{mail.from[0]}</span>
                    </div>
                    <div className="cntx">
                      <h3 className="from">{mail.from}</h3>
                      <h4 className="date">{dateformat(new Date(mail.time), CONSTANTS.DATE_FORMAT)}</h4>
                      <p className="subject">{mail.subject}</p>
                      <p className="context">{mail.body}</p>
                    </div>
                    <div className="opt">
                      <div className="opt-i">
                        <button className="mdl-button mdl-js-button mdl-button--icon" name="add" onClick={this.handleSave}><i className="material-icons" data-index={key}>save</i></button>
                      </div>
                      <div className="opt-i">
                        <button className="mdl-button mdl-js-button mdl-button--icon" name="delete" onClick={this.handleDeleteFromInbox}><i className="material-icons" data-index={key}>delete</i></button>
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
              savedSize === 0 ? <li className="mdl-card">Saved empty</li> : Object.keys(coreData.saved).map((key) => {
                let mail = coreData.saved[key];
                if (!mail) {
                  return;
                }
                if (!self.listColors.hasOwnProperty(mail.from)) {
                  self.listColors[mail.from] = `bg-color-${Object.keys(self.listColors).length % 10}`
                }
                 return (
                  <li className="mdl-card" key={key}>
                    <div className="icon">
                      <span className={this.listColors[mail.from]}>{mail.from[0]}</span>
                    </div>
                    <div className="cntx">
                      <h3 className="from">{mail.from}</h3>
                      <h4 className="date">{dateformat(new Date(mail.time), CONSTANTS.DATE_FORMAT)}</h4>
                      <p className="subject">{mail.subject}</p>
                      <p className="context">{mail.body}</p>
                    </div>
                    <div className="opt">
                      <div className="opt-i">
                        <button className="mdl-button mdl-js-button mdl-button--icon" name="delete" onClick={this.handleDeleteSaved}><i className="material-icons" data-index={key}>delete</i></button>
                      </div>
                    </div>
                  </li>
                )
              })
            }
          </div>
        );
      }
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
