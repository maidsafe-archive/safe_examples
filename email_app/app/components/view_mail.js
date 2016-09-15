import React, { Component, PropTypes } from 'react';
import * as base64 from 'urlsafe-base64';
import { showError, showSuccess, hashEmailId } from '../utils/app_utils';
import { CONSTANTS } from '../constants';

export default class ViewMail extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor() {
    super();
    this.handlerId = null;
    this.appendableHandlerId = null;
    this.goBack = this.goBack.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.fetchAppendableDataHandler = this.fetchAppendableDataHandler.bind(this);
    this.deleteFromAppendableData = this.deleteFromAppendableData.bind(this);
    this.dropAppendableDatahandler = this.dropAppendableDatahandler.bind(this);
  }

  componentWillMount() {
    const { coreData, params, setActiveMail } = this.props;
    console.log(params.index);
    switch (params.type) {
      case CONSTANTS.HOME_TABS.INBOX: {
        setActiveMail(coreData.inbox[params.index]);
        break;
      }
      case CONSTANTS.HOME_TABS.OUTBOX: {
        setActiveMail(coreData.outbox[params.index]);
        break;
      }
      case CONSTANTS.HOME_TABS.SAVED: {
        setActiveMail(coreData.saved[params.index]);
        break;
      }
    }
  }

  dropAppendableDatahandler() {
    const { token, dropHandler } = this.props;
    dropHandler(token, this.appendableHandlerId)
      .then(res => {
        if (res.error) {
          return showError('Drop Appendable data error', res.error.message);
        }
        return this.goBack();
      });
  }

  deleteFromAppendableData() {
    const { token, params, deleteAppendableData } = this.props;
    deleteAppendableData(token, this.appendableHandlerId, params.index)
      .then(res => {
        if (res.error) {
          return showError('Delete Appendabel Data Error', res.error.message);
        }
        return this.dropAppendableDatahandler();
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

  goBack() {
    const { params } = this.props;
    switch (params.type) {
      case CONSTANTS.HOME_TABS.INBOX: {
        return this.context.router.push('/inbox');
      }
      case CONSTANTS.HOME_TABS.OUTBOX: {
        return this.context.router.push('/outbox');
      }
      case CONSTANTS.HOME_TABS.SAVED: {
        return this.context.router.push('/saved');
      }
    }
  }

  handleClose(e) {
    e.preventDefault();
    return this.goBack();
  }

  handleDelete(e) {
    e.preventDefault();
    const { token, coreData, coreDataHandler, params, updateCoreStructure } = this.props;
    switch (params.type) {
      case CONSTANTS.HOME_TABS.INBOX: {
        return this.fetchAppendableDataHandler();
      }
      case CONSTANTS.HOME_TABS.OUTBOX: {
        let outbox = [];
        outbox = coreData.outbox.filter(mail => {
          if (mail.dataId !== params.to) {
            return mail;
          }
        });
        coreData.outbox = outbox;
        break;
      }
      case CONSTANTS.HOME_TABS.SAVED: {
        let saved = [];
        saved = coreData.saved.filter(mail => {
          if (mail.dataId !== params.to) {
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
        return this.goBack();
      });
  }

  handleSave(e) {
    e.preventDefault();
    const { token, coreData, coreDataHandler, activeMail, updateCoreStructure } = this.props;
    coreData.saved.unshift(activeMail);
    updateCoreStructure(token, coreDataHandler, coreData)
      .then(res => {
        if (res.error) {
          return showError('Saving Mail Error', res.error.message);
        }
        return this.fetchAppendableDataHandler();
      });
  }

  render() {
    const { activeMail, processing, params } = this.props;
    if (processing) {
      return (<div className="heading-lg text-center">Loading...</div>);
    }

    const options = [];
    if (params.type === CONSTANTS.HOME_TABS.INBOX) {
      options.push(
        <div className="opt-i left" key="saveOpt">
          <button type="button" className="btn primary" onClick={this.handleSave}>Save</button>
        </div>
      );
    }
    options.push((
      <div className="opt-i left" key="deleteOpt">
        <button type="button" className="btn danger" onClick={this.handleDelete}>Delete</button>
      </div>
    ))
    return (
      <div className="view-mail">
        <div className="head">
          <div className="action back">
            <button type="button" className="btn" onClick={this.handleClose}>Back</button>
          </div>
        </div>
        <div className="view-mail-b">
          <div className="fields">
            <span className="name">{params.type === CONSTANTS.HOME_TABS.INBOX ? 'From:' : 'To:'}</span>
            <span className="val">{activeMail.from || activeMail.to}</span>
          </div>
          <div className="fields">
            <span className="name">Subject:</span>
            <span className="val">{activeMail.subject}</span>
          </div>
          <div className="fields">
            <span className="name">Date:</span>
            <span className="val">{activeMail.time}</span>
          </div>
          <div className="content">
            {activeMail.body}
          </div>
          <div className="opt">
            {
              options.map((opt, i) => {
                return opt;
              })
            }
          </div>
        </div>
      </div>
    );
  }
}
