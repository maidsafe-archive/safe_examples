import React, { Component, PropTypes } from 'react';
import MailList from './mail_list';
import * as base64 from 'urlsafe-base64';
import { showError, hashEmailId } from '../utils/app_utils';
import { CONSTANTS } from '../constants';

export default class MailInbox extends Component {
  constructor() {
    super();
    this.appendableHandler = 0;
    this.dataLength = 0;
    this.currentIndex = 0;
    this.refresh = this.refresh.bind(this);
    this.fetchMails = this.fetchMails.bind(this);
    this.fetchMail = this.fetchMail.bind(this);
    this.iterateAppendableData = this.iterateAppendableData.bind(this);
    this.getAppendableDataLength = this.getAppendableDataLength.bind(this);
    this.dropAppendableData = this.dropAppendableData.bind(this);
    this.fetchAppendableDataHandler = this.fetchAppendableDataHandler.bind(this);
    this.fetchAppendableData = this.fetchAppendableData.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.fetchMails();
  }

  dropAppendableData() {
    const { token, dropHandler, clearMailProcessing } = this.props;
    dropHandler(token, this.appendableHandler)
      .then(res => {
        clearMailProcessing();
        if (res.error) {
          return showError('Drop Appendable data error', res.error.message);
        }
      });
  }

  getAppendableDataLength() {
    const { token, getAppendableDataLength, clearMailProcessing } = this.props;
    getAppendableDataLength(token, this.appendableHandler)
      .then(res => {
        if (res.error) {
          clearMailProcessing();
          return showError('Get Appendable Data Length Error', res.error.message);
        }
        return this.dropAppendableData();
      });
  }

  fetchMail(handlerId) {
    const { token, fetchMail, pushToInbox, clearMailProcessing } = this.props;
    fetchMail(token, handlerId)
      .then(res => {
        if (res.error) {
          clearMailProcessing();
          return showError('Fetch Mail Error', res.error.message);
        }
        const data = new Buffer(res.payload.data).toString();
        pushToInbox(JSON.parse(data));
        this.currentIndex++;
        if (this.dataLength === this.currentIndex) {
          return this.getAppendableDataLength();
        }

        return this.iterateAppendableData();
      });
  }

  iterateAppendableData() {
    const { token, appendableDataId, fetchDataIdAt, clearMailProcessing } = this.props;
    fetchDataIdAt(token, appendableDataId, this.currentIndex)
      .then(res => {
        if (res.error) {
          clearMailProcessing();
          return showError('Fetch Data Id At Error', res.error.message);
        }
        return this.fetchMail(res.payload.headers['handle-id']);
      });
  }

  fetchAppendableData() {
    const { token, fetchAppendableData, clearMailProcessing } = this.props;

    fetchAppendableData(token, this.appendableHandler)
      .then((res) => {
        if (res.error) {
          clearMailProcessing();
          return showError('Fetch Appendable Data Error', res.error.message);
        }
        const dataLength = parseInt(res.payload.headers['data-length']);
        if (dataLength === 0) {
          return this.getAppendableDataLength();
        }
        this.dataLength = dataLength;
        return this.iterateAppendableData();
      });
  }

  fetchAppendableDataHandler() {
    const { token, coreData, fetchAppendableDataHandler, setAppendableDataId, clearMailProcessing } = this.props;
    const hashedEmailId = hashEmailId(coreData.id);

    fetchAppendableDataHandler(token, base64.encode(hashedEmailId))
      .then(res => {
        if (res.error) {
          clearMailProcessing();
          return showError('Get Appendable Data Handler Error', res.error.message);
        }
        this.appendableHandler = res.payload.headers['handle-id'];
        setAppendableDataId(res.payload.headers['handle-id']);
        return this.fetchAppendableData();
      });
  }

  fetchMails() {
    this.props.clearInbox();
    this.props.setMailProcessing();
    return this.fetchAppendableDataHandler();
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
