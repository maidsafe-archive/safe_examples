import { connect } from 'react-redux';
import CreateAccount from '../components/create_account';
import { createAccount, createAccountError, storeNewAccount, refreshConfig } from '../actions';

const mapStateToProps = state => {
  return {
    accStatus: state.emailApp.accStatus,
    error: state.emailApp.error,
    processing: state.emailApp.processing,
    emailIds: state.emailApp.emailIds,
    newAccount: state.emailApp.newAccount,
    coreData: state.emailApp.coreData
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createAccountError: (error) => (dispatch(createAccountError(error))),
    createAccount: (emailId) => (dispatch(createAccount(emailId))),
    storeNewAccount: (account) => (dispatch(storeNewAccount(account))),
    refreshConfig: (emailId) => (dispatch(refreshConfig(emailId)))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount);
