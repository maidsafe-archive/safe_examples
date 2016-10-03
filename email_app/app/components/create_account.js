import React, { Component, PropTypes } from 'react';
import { hashEmailId } from '../utils/app_utils';
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
    this.appendableDataHandle = 0;
    this.handleCreateAccount = this.handleCreateAccount.bind(this);
    this.createAppendableData = this.createAppendableData.bind(this);
    this.updateStructuredData = this.updateStructuredData.bind(this);
    this.dropAppendableData = this.dropAppendableData.bind(this);
  }

  dropAppendableData() {
    const { token, dropAppendableDataHandle, setCreateAccountError } = this.props;
    dropAppendableDataHandle(token, this.appendableDataHandle)
      .then(res => {
        if (res.error) {
          return setCreateAccountError(res.error);
        }
        console.warn('Dropped Appendable Data Handle');
      });
  }

  updateStructuredData(emailId) {
    const { token, rootSDHandle, coreData, updateStructuredData, postStructuredData, setCreateAccountError, getCipherOptsHandle, deleteCipherOptsHandle } = this.props;
    coreData.id = emailId;

    const post = () => {
      postStructuredData(token, rootSDHandle)
        .then((res) => {
          if (res.error) {
            return setCreateAccountError(res.error);
          }
          return this.context.router.push('/home');
        });
    };

    const update = (cipherHandleId) => {
      updateStructuredData(token, rootSDHandle, coreData, cipherHandleId)
        .then((res) => {
          if (res.error) {
            return setCreateAccountError(res.error);
          }
          deleteCipherOptsHandle(token, cipherHandleId);
          return post();
        });
    };

    const getCipherHandle = () => {
      getCipherOptsHandle(token, CONSTANTS.ENCRYPTION.SYMMETRIC)
        .then(res => {
          if (res.error) {
            return setCreateAccountError(res.error);
          }
          return update(res.payload.data.handleId);
        });
    };

    getCipherHandle();
  }

  createAppendableData(emailId) {
    const { token, createAppendableData, setCreateAccountError, putAppendableData } = this.props;
    const appendableDataName = hashEmailId(emailId);
    const put = () => {
      putAppendableData(token, this.appendableDataHandle)
        .then(res => {
          if (res.error) {
            return setCreateAccountError(new Error(MESSAGES.EMAIL_ALREADY_TAKEN));
          }
          this.dropAppendableData();
          return this.updateStructuredData(emailId);
        });
    };

    createAppendableData(token, appendableDataName)
      .then(res => {
        if (res.error) {
          return setCreateAccountError(new Error(MESSAGES.EMAIL_ALREADY_TAKEN));
        }
        this.appendableDataHandle = res.payload.data.handleId;
        return put();
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
