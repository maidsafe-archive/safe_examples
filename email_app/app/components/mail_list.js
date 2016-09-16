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
    this.fetchCoreStructure = this.fetchCoreStructure.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.fetchAppendableDataHandler = this.fetchAppendableDataHandler.bind(this);
    this.deleteFromAppendableData = this.deleteFromAppendableData.bind(this);
    this.dropAppendableDatahandler = this.dropAppendableDatahandler.bind(this);
    this.clearDeleteData = this.clearDeleteData.bind(this);
  }

  componentWillMount() {
    const { coreData, setActiveMail } = this.props;
    switch (this.activeType) {
      case CONSTANTS.HOME_TABS.INBOX: {
        setActiveMail(coreData.inbox[this.activeIndex]);
        break;
      }
      case CONSTANTS.HOME_TABS.OUTBOX: {
        setActiveMail(coreData.outbox[this.activeIndex]);
        break;
      }
      case CONSTANTS.HOME_TABS.SAVED: {
        setActiveMail(coreData.saved[this.activeIndex]);
        break;
      }
    }
  }

  goBack() {
    const { router } = this.context;

    switch (this.activeType) {
      case CONSTANTS.HOME_TABS.INBOX: {
        return this.props.inbox.refresh();
      }
      case CONSTANTS.HOME_TABS.OUTBOX: {
        return router.push('/outbox');
      }
      case CONSTANTS.HOME_TABS.SAVED: {
        router.push('/home');
        return router.push('/saved');
      }
    }
  }

  fetchCoreStructure() {
    const { token, coreDataHandler, fetchCoreStructure } = this.props;
    if (this.activeType === CONSTANTS.HOME_TABS.INBOX) {
      return this.goBack();
    }
    fetchCoreStructure(token, coreDataHandler)
      .then(res => {
        if (res.error) {
          return showError('Get Structure Data Error', res.error.message);
        }
        return this.goBack();
      });
  }

  dropAppendableDatahandler() {
    const { token, dropHandler } = this.props;
    dropHandler(token, this.appendableHandlerId)
      .then(res => {
        if (res.error) {
          return showError('Drop Appendable data error', res.error.message);
        }
        return this.fetchCoreStructure();
      });
  }

  clearDeleteData() {
    const { token, clearDeleteData } = this.props;
    clearDeleteData(token, this.appendableHandlerId)
      .then(res => {
        if (res.error) {
          return showError('Clear Appendabel Delete Data Error', res.error.message);
        }
        return this.dropAppendableDatahandler();
      });
  }

  deleteFromAppendableData() {
    const { token, deleteAppendableData } = this.props;
    deleteAppendableData(token, this.appendableHandlerId, this.activeIndex)
      .then(res => {
        if (res.error) {
          return showError('Delete Appendabel Data Error', res.error.message);
        }
        return this.clearDeleteData();
      });
  }

  fetchAppendableDataHandler() {
    const { token, coreData, fetchAppendableDataHandler } = this.props;
    const hashedEmailId = hashEmailId(coreData.id);

    fetchAppendableDataHandler(token, base64.encode(hashedEmailId))
      .then(res => {
        if (res.error) {
          return showError('Get Appendable Data Handler Error', res.error.message);
        }
        this.appendableHandlerId = res.payload.headers['handle-id'];
        return this.deleteFromAppendableData();
      });
  }

  handleDelete(e) {
    e.preventDefault();
    const confirmDelete = (res) => {
      if (res === 1) {
        return;
      }
      this.activeIndex = parseInt(e.target.dataset.index);
      const { token, coreData, coreDataHandler, updateCoreStructure } = this.props;
      switch (this.activeType) {
        case CONSTANTS.HOME_TABS.INBOX: {
          return this.fetchAppendableDataHandler();
        }
        case CONSTANTS.HOME_TABS.OUTBOX: {
          let outbox = [];
          outbox = coreData.outbox.filter((mail, i) => {
            if (i !== this.activeIndex) {
              return mail;
            }
          });
          coreData.outbox = outbox;
          break;
        }
        case CONSTANTS.HOME_TABS.SAVED: {
          let saved = [];
          saved = coreData.saved.filter((mail, i) => {
            if (i !== this.activeIndex) {
              return mail;
            }
          });
          coreData.saved = saved;
          break;
        }
      }
      updateCoreStructure(token, coreDataHandler, coreData)
        .then(res => {
          if (res.error) {
            return showError('Deleting Mail Error', res.error.message);
          }
          showSuccess('Deleted Mail', 'Mail Deleted Successfully');
          return this.fetchCoreStructure();
        });
    };
    // remote.dialog.showMessageBox({
    //   type: 'warning',
    //   title: 'Do you want to Delete?',
    //   message: '',
    //   buttons: [ 'Ok', "Cancel" ]
    // }, confirmDelete);

    confirmDelete(0);
  }

  handleSave(e) {
    e.preventDefault();
    this.activeIndex = parseInt(e.target.dataset.index);
    const { token, coreData, coreDataHandler, updateCoreStructure } = this.props;
    coreData.saved.unshift(coreData.inbox[this.activeIndex]);
    delete coreData.inbox[this.activeIndex];
    updateCoreStructure(token, coreDataHandler, coreData)
      .then(res => {
        if (res.error) {
          return showError('Saving Mail Error', res.error.message);
        }
        return this.fetchAppendableDataHandler();
      });
  }

  render() {
    const { processing, coreData, error, inbox, outbox, saved } = this.props;
    let container = null;
    const self = this;
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
      if (outbox) {
        this.activeType = CONSTANTS.HOME_TABS.OUTBOX;
        container = (
          <div>
            {
              coreData.outbox.length === 0 ? <li className="mdl-card">Outbox empty</li> : coreData.outbox.map((mail, i) => {
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
                        <button
                          className="mdl-button mdl-js-button mdl-button--icon"
                          name="delete" onClick={this.handleDelete}
                        >
                          <i className="material-icons" data-index={i}>delete</i>
                        </button>
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
