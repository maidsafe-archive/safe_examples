import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import * as base64 from 'urlsafe-base64';
import dateformat from 'dateformat';
import { showError, showSuccess, hashEmailId } from '../utils/app_utils';
import { CONSTANTS } from '../constants';

export default class MailList extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor() {
    super();
    this.appendableHandlerId = null;
    this.listColors = {};
    this.activeIndex = null;
    this.activeType = null;
    this.goBack = this.goBack.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  goBack() {
    const { router } = this.context;

    switch (this.activeType) {
      case CONSTANTS.HOME_TABS.INBOX: {
        return this.props.inbox.refresh();
      }
      case CONSTANTS.HOME_TABS.SAVED: {
        router.push('/home');
        return router.push('/saved');
      }
    }
  }

  handleDelete(e) {
    e.preventDefault();
  }

  handleSave(e) {
    e.preventDefault();
  }

  render() {
    const self = this;
    const { processing, coreData, error, inbox, outbox, saved } = this.props;
    let container = null;

    if (processing) {
      container = <li className="mdl-card">Loading...</li>
    } else if (Object.keys(error).length > 0) {
      container = <li className="error">Error in fetching mails!</li>
    } else {
      if (inbox) {
        this.activeType = CONSTANTS.HOME_TABS.INBOX;
        container = (
          <div>
            {
              coreData.inbox.length === 0 ? <li className="mdl-card" title="No data in appendable data">Inbox empty</li> : coreData.inbox.map((mail, i) => {
                if (!self.listColors.hasOwnProperty(mail.from)) {
                  self.listColors[mail.from] = `bg-color-${Object.keys(self.listColors).length % 10}`
                }
                return (
                  <li className="mdl-card" key={i}>
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
                        <button className="mdl-button mdl-js-button mdl-button--icon" name="add" onClick={this.handleSave}><i className="material-icons" data-index={i}>save</i></button>
                      </div>
                      <div className="opt-i">
                        <button className="mdl-button mdl-js-button mdl-button--icon" name="delete" onClick={this.handleDelete}><i className="material-icons" data-index={i}>delete</i></button>
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
              coreData.saved.length === 0 ? <li className="mdl-card">Saved empty</li> : coreData.saved.map((mail, i) => {
                if (!mail) {
                  return;
                }
                if (!self.listColors.hasOwnProperty(mail.from)) {
                  self.listColors[mail.from] = `bg-color-${Object.keys(self.listColors).length % 10}`
                }
                 return (
                  <li className="mdl-card" key={i}>
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
                        <button className="mdl-button mdl-js-button mdl-button--icon" name="delete" onClick={this.handleDelete}><i className="material-icons" data-index={i}>delete</i></button>
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
