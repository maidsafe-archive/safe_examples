import React, { Component, PropTypes } from 'react';
import * as base64 from 'urlsafe-base64';
import { hashEmailId, showError, showSuccess } from '../utils/app_utils';
import { CONSTANTS } from '../constants';

export default class ComposeMail extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor() {
    super();
    this.newMail = {};
    this.tempMailContent = null;
    this.newMailId = null;
    this.appendableDataId = null;
    this.sendMail = this.sendMail.bind(this);
    this.createMail = this.createMail.bind(this);
    this.handleTextLimit = this.handleTextLimit.bind(this);
  }



  createMail(cipherHandleId) {
    const { token, createImmutableDataWriterHandle, writeImmutableData, putImmutableData, closeImmutableDataWriter, clearMailProcessing } = this.props;

    const dropWriter = (writerHandle) => {
      closeImmutableDataWriter(token, writerHandle)
        .then(res => {
          if (res.error) {
            return console.error('Drop Immutable Data Writer Handle Error', res.error.message);
          }
          console.warn('Immutable Data Writer Handle Dropped');
        });
    };

    const save = (writerHandleId) => {
      putImmutableData(token, writerHandleId, cipherHandleId)
        .then(res => {
          if (res.error) {
            clearMailProcessing();
            return showError('Create Immutable Data Writer Error', res.error.message);
          }
          dropWriter(writerHandleId);
          return this.appendAppendableData(res.payload.data.handleId);
        });
    };

    const write = (writerHandleId) => {
      writeImmutableData(token, writerHandleId, this.newMail)
        .then(res => {
          if (res.error) {
            clearMailProcessing();
            return showError('Create Immutable Data Writer Error', res.error.message);
          }
          return save(writerHandleId);
        })
    };

    const createImmutWriter = () => {
      createImmutableDataWriterHandle(token)
        .then(res => {
          if (res.error) {
            clearMailProcessing();
            return showError('Create Immutable Data Writer Error', res.error.message);
          }
          return write(res.payload.data.handleId);
        });
    };
    createImmutWriter();
  }


  sendMail(e) {
    const { token, fromMail, setMailProcessing } = this.props;

    e.preventDefault();
    const mailTo = this.mailTo.value.trim();
    const mailSub = this.mailSub.value.trim();
    const mailContent = this.mailContent.value.trim();
    if (!mailTo || !mailSub || !mailContent) {
      return;
    }
    if (mailContent.length > CONSTANTS.MAIL_CONTENT_LIMIT) {
      return showError('Mail Content is too Long', 'Mail Content is too long!');
    }
    this.newMail = {
      subject: mailSub,
      from: fromMail,
      time: (new Date()).toUTCString(),
      body: mailContent
    };
    setMailProcessing();
    return this.getAppendableDataIdHandle(mailTo);
  }

  handleCancel() {
    this.props.cancelCompose();
    this.context.router.push('/home');
  }

  handleTextLimit(e) {
    if (this.mailContent.value.length > CONSTANTS.MAIL_CONTENT_LIMIT) {
      return this.mailContent.classList.add('hasError');
    }
    this.mailContent.classList.remove('hasError');
  }

  render() {
    const { error, processing } = this.props;

    return (
      <div className="compose-mail">
        <div className="compose-mail-b">
          <h3 className="title heading-lg text-center">Compose Mail</h3>
          <form className="form" onSubmit={this.sendMail}>
            <div className="inp-grp">
              <input type="text" name="mailTo" id="mailTo" ref={c => {
                this.mailTo = c;
              }} required="required" autoFocus="autoFocus"/>
              <label htmlFor="mailTo">To</label>
            </div>
            <div className="inp-grp">
              <input type="text" name="mailSub" id="mailSub" ref={c => {
                this.mailSub = c;
              }} required="required"/>
              <label htmlFor="mailSub">Subject</label>
            </div>
            <div className="inp-grp">
              <textarea name="mailContent" onKeyUp={this.handleTextLimit} ref={c => {
                this.mailContent = c;
              }} required="required">{' '}</textarea>
              <div className="limit">
                Only { CONSTANTS.MAIL_CONTENT_LIMIT } characters allowed. (This is just a restriction in this tutorial to not handle multiple chunks for content)
              </div>
            </div>
            <div className="inp-btn-cnt">
              <button type="submit" className="mdl-button mdl-js-button mdl-button--raised bg-primary btn-eq" disabled={processing}>{processing ? 'Sending' : 'Send'}</button>
              <button type="button" className="mdl-button mdl-js-button mdl-button--raised btn-eq" disabled={processing ? 'disabled' : ''} onClick={this.handleCancel}>
                Cancel
              </button>
            </div>
          </form>
          <h3 className="error text-center">{error.message}</h3>
        </div>
      </div>
    );
  }
}
