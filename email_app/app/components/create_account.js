import React, { Component, PropTypes } from 'react';
import { hashEmailId, showError } from '../utils/app_utils';
import { MESSAGES, CONSTANTS } from '../constants';

export default class CreateAccount extends Component {
  static propTypes = {
    authorised: PropTypes.bool.isRequired,
    processing: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor() {
    super();
    this.errMrg = null;
    this.appendableHandler = 0;
    this.handleCreateAccount = this.handleCreateAccount.bind(this);
    this.createAppendableData = this.createAppendableData.bind(this);
    this.updateCoreStructure = this.updateCoreStructure.bind(this);
    this.dropAppendableData = this.dropAppendableData.bind(this);
  }

  dropAppendableData() {
    const { token, dropHandler } = this.props;
    dropHandler(token, this.appendableHandler)
      .then(res => {
        if (res.error) {
          return setCreateAccountError(this.errMrg || res.error);
        }
        return this.context.router.push('/home');
      });
  }

  updateCoreStructure(emailId) {
    const { token, coreDataHandler, coreData, updateCoreStructure, setCreateAccountError } = this.props;
    coreData.id = emailId;
    updateCoreStructure(token, coreDataHandler, coreData)
      .then((res) => {
        if (res.error) {
          this.errMrg = res.error;
        }
        return this.dropAppendableData();
      });
  }

  createAppendableData(emailId) {
    const { token, createAppendableData, setAppendableDataId, setCreateAccountError } = this.props;
    const hashedEmailId = hashEmailId(emailId);

    createAppendableData(token, hashedEmailId)
      .then(res => {
        if (res.error) {
          return setCreateAccountError(new Error(MESSAGES.EMAIL_ALREADY_TAKEN));
        }
        this.appendableHandler = res.payload.headers['handle-id'];
        return this.updateCoreStructure(emailId);
      });
  }

  handleCreateAccount(e) {
    e.preventDefault();
    const emailId = this.emailId.value;
    if (!emailId.trim()) {
      return;
    }
    if (emailId.length > CONSTANTS.NEW_EMAIL_SIZE) {
      return this.props.setCreateAccountError(new Error(MESSAGES.EMAIL_TOO_LONG));
    }
    this.props.setCreateAccountProcessing();
    return this.createAppendableData(emailId);
  }

  render() {
    const { processing, error } = this.props;

    return (
      <div className="create-account">
        <div className="create-account-b">
          <div className="create-account-cnt text-center">
            <h3 className="title">Create Email Id</h3>
            <form className="form" onSubmit={this.handleCreateAccount}>
              <div className="inp-grp">
                <input type="text" name="emailId" id="emailId" ref={c => {this.emailId = c;}} autoFocus="autoFocus" required="required" />
                <label htmlFor="emailId">Email ID</label>
                <div className="alert">Email Id must be less than {CONSTANTS.NEW_EMAIL_SIZE} characters. (This is just a restriction in this tutorial)</div>
              </div>
              <div className="inp-btn-cnt">
                <button type="submit" className="mdl-button mdl-js-button mdl-button--raised bg-primary" disabled={processing}>Create</button>
              </div>
            </form>
            <h4 className="error">{error.message}</h4>
          </div>
        </div>
      </div>
    );
  }
}
