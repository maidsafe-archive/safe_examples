import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MESSAGES, CONSTANTS, SAFE_APP_ERROR_CODES } from '../constants';

export default class CreateAccount extends Component {
  constructor() {
    super();
    this.errMrg = null;
    this.handleCreateAccount = this.handleCreateAccount.bind(this);
    this.storeCreatedAccount = this.storeCreatedAccount.bind(this);
    this.handleChooseAccount = this.handleChooseAccount.bind(this);
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
        if (err.code === SAFE_APP_ERROR_CODES.ERR_DATA_EXISTS
          || err.code === SAFE_APP_ERROR_CODES.ENTRY_ALREADY_EXISTS) {
          return createAccountError(new Error(MESSAGES.EMAIL_ALREADY_TAKEN));
        }
        return createAccountError(err);
      });
  };

  handleChooseAccount(e) {
    e.preventDefault();
    const { refreshConfig, createAccountError } = this.props;
    const emailId = this.emailSelected.value;

    return refreshConfig(emailId)
      .then((_) => this.context.router.push('/home'))
      .catch((e) => createAccountError(new Error(e)));
  };

  render() {
    console.log("Email IDs to choose from: ", this.props.email_ids);

    const emailList = this.props.email_ids.length === 0 ? [ 'Email1', 'Email2', 'Email3' ] : this.props.email_ids;

    const { processing, error } = this.props;
    return (
      <div className="create-account">
        <div className="create-account-b">
          <div className="create-account-cnt text-center">
            <div className="split-view">
              <div className="split-view-i">
                <div className="create-email">
                  <h3 className="title">Create Email Id</h3>
                  <form className="form" onSubmit={this.handleCreateAccount}>
                    <div className="inp-grp">
                      <input type="text" name="emailId" id="emailId" ref={c => {this.emailId = c;}} autoFocus="autoFocus" required="required" />
                      <label htmlFor="emailId">Email ID</label>
                      <div className="alert">Email Id must be less than {CONSTANTS.EMAIL_ID_MAX_LENGTH} characters. (This is just a restriction in this tutorial)</div>
                    </div>
                    <div className="inp-btn-cnt">
                      <button type="submit" className="mdl-button mdl-js-button mdl-button--raised bg-primary" disabled={processing.state}>Create</button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="split-view-i">
                <div className="email-ls">
                  <h3 className="title">Select Email Id</h3>
                  <form className="form">
                    <div className="inp-grp">
                      <div
                        className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fix-height">
                        <input
                          className="mdl-textfield__input"
                          type="text"
                          id="selectEmail"
                          ref={(c) => { this.emailSelected = c;}}
                          readOnly="readOnly"
                          placeholder="Select email ID"
                          tabIndex="-1"
                          value={emailList[0]}
                        />
                        {
                          emailList.length !== 0 ? (<ul htmlFor="selectEmail" className="mdl-menu mdl-menu--bottom-left mdl-js-menu">
                              { emailList.map((email, i) => {
                                return (<li key={`email${i}`} className="mdl-menu__item">{email}</li>)
                              }) }
                            </ul>) : null
                        }
                      </div>
                      <div className="inp-btn-cnt">
                        <button
                          type="submit"
                          className="mdl-button mdl-js-button mdl-button--raised bg-primary"
                          disabled={emailList.length === 0}
                          onClick={this.handleChooseAccount}
                        >Select</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
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
