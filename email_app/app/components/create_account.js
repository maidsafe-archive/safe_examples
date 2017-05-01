import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MESSAGES, CONSTANTS } from '../constants';

export default class CreateAccount extends Component {
  constructor() {
    super();
    this.errMrg = null;
    this.handleCreateAccount = this.handleCreateAccount.bind(this);
    this.storeCreatedAccount = this.storeCreatedAccount.bind(this);
  }

  storeCreatedAccount() {
    const { newAccount, storeNewAccount, createAccountError } = this.props;
    return storeNewAccount(newAccount)
        .then((_) => this.context.router.push('/home'))
        .catch((e) => createAccountError(new Error(e)));
  }

  handleCreateAccount(e) {
    e.preventDefault();
    const { createAccount, createAccountError } = this.props;
    const emailId = this.emailId.value;
    if (!emailId.trim()) {
      return;
    }

    if (emailId.length > CONSTANTS.EMAIL_ID_MAX_LENGTH) {
      return createAccountError(new Error(MESSAGES.EMAIL_ID_TOO_LONG));
    }

    return createAccount(emailId)
        .then(this.storeCreatedAccount)
        .catch((err) => {
          if (err.name === 'ERR_DATA_EXISTS') {
            return createAccountError(new Error(MESSAGES.EMAIL_ALREADY_TAKEN));
          }
          return createAccountError(err);
        });
  };

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
                <div className="alert">Email Id must be less than {CONSTANTS.EMAIL_ID_MAX_LENGTH} characters. (This is just a restriction in this tutorial)</div>
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

CreateAccount.contextTypes = {
  router: PropTypes.object.isRequired
};
