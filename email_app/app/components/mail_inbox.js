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
    this.iterateAppendableData = this.iterateAppendableData.bind(this);
    this.getAppendableDataLength = this.getAppendableDataLength.bind(this);
    this.dropAppendableData = this.dropAppendableData.bind(this);
    this.getAppendableDataIdHandle = this.getAppendableDataIdHandle.bind(this);
    this.fetchAppendableDataHandle = this.fetchAppendableDataHandle.bind(this);
    this.fetchAppendableDataMeta = this.fetchAppendableDataMeta.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.fetchMails();
  }

  dropAppendableData() {
    const { token, dropAppendableDataHandle, clearMailProcessing } = this.props;
    dropAppendableDataHandle(token, this.appendableDataHandle)
      .then(res => {
        clearMailProcessing();
        if (res.error) {
          return showError('Drop Appendable data error', res.error.message);
        }
      });
  }

  getAppendableDataLength() {
    const { token, getAppendableDataLength, clearMailProcessing } = this.props;
    getAppendableDataLength(token, this.appendableDataHandle)
      .then(res => {
        if (res.error) {
          clearMailProcessing();
          return showError('Get Appendable Data Length Error', res.error.message);
        }
        return this.dropAppendableData();
      });
  }

  fetchMail(immutableHandleId) {

    const { token, getImmutableDataReadHandle, readImmutableData, closeImmutableDataReader, pushToInbox, clearMailProcessing } = this.props;

    const closeReader = (handleId) => {
      closeImmutableDataReader(token, handleId)
        .then(res => {
          if (res.error) {
            return console.error('Close Immutable Data Reader Error', res.error.message);
          }
          console.warn('Closed Immutable Data Reader');
        });
    };

    const read = (handleId) => {
      readImmutableData(token, handleId)
        .then(res => {
          if (res.error) {
            clearMailProcessing();
            return showError('Read Immutable Data Error', res.error.message);
          }
          closeReader(handleId);
          const data = new Buffer(res.payload.data).toString();
          pushToInbox(JSON.parse(data));
          this.currentIndex++;
          if (this.dataLength === this.currentIndex) {
            return this.getAppendableDataLength();
          }
          return this.iterateAppendableData();
        });
    };

    const getImmutReader = () => {
      console.log('====', immutableHandleId);
      getImmutableDataReadHandle(token, immutableHandleId)
        .then(res => {
          if (res.error) {
            clearMailProcessing();
            return showError('Get Immutable Data Reader Error', res.error.message);
          }
          return read(res.payload.data.handleId);
        });
    };
    getImmutReader();
  }

  iterateAppendableData() {
    const { token, fetchDataIdAt, clearMailProcessing } = this.props;
    fetchDataIdAt(token, this.appendableDataHandle, this.currentIndex)
      .then(res => {
        if (res.error) {
          clearMailProcessing();
          return showError('Fetch Data Id At Error', res.error.message);
        }
        return this.fetchMail(res.payload.data.handleId);
      });
  }

  fetchAppendableDataMeta() {
    const { token, fetchAppendableDataMeta, clearMailProcessing } = this.props;

    fetchAppendableDataMeta(token, this.appendableDataHandle)
      .then((res) => {
        if (res.error) {
          clearMailProcessing();
          return showError('Fetch Appendable Data Meta Error', res.error.message);
        }
        const dataLength = parseInt(res.payload.data.dataLength);
        if (dataLength === 0) {
          return this.getAppendableDataLength();
        }
        this.dataLength = dataLength;
        return this.iterateAppendableData();
      });
  }

  fetchAppendableDataHandle(dataIdHandle) {
    const { token, fetchAppendableDataHandle, dropHandler, clearMailProcessing } = this.props;

    const dropDataIdHandle = () => {
      dropHandler(token, dataIdHandle)
        .then((res) => {
          if (res.error) {
            return console.error(res.error.message);
          }
          console.warn(res.payload.data);
        });
    };

    fetchAppendableDataHandle(token, dataIdHandle)
      .then(res => {
        if (res.error) {
          clearMailProcessing();
          return showError('Get Appendable Data Handler Error', res.error.message);
        }
        this.appendableDataHandle = res.payload.data.handleId;
        dropDataIdHandle();
        return this.fetchAppendableDataMeta();
      });
  }

  getAppendableDataIdHandle() {
    const { token, coreData, getAppendableDataIdHandle, clearMailProcessing } = this.props;
    const appendableDataName = hashEmailId(coreData.id);

    getAppendableDataIdHandle(token, appendableDataName)
      .then((res) => {
        if (res.error) {
          clearMailProcessing();
          return showError('Get Appendable Data Handler Error', res.error.message);
        }
        this.fetchAppendableDataHandle(res.payload.data.handleId);
      });
  }

  fetchMails() {
    const { clearInbox, setMailProcessing } = this.props;
    clearInbox();
    setMailProcessing();
    return this.getAppendableDataIdHandle();
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
