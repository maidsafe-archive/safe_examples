import { connect } from 'react-redux';
import CreateAccount from '../components/create_account';
import { createAccount, createAccountError } from '../actions/create_account_actions';
import { storeNewAccount, refreshConfig } from '../actions/initialiser_actions';

const mapStateToProps = state => {
  return {
    accStatus: state.createAccount.accStatus,
    error: state.createAccount.error,
    processing: state.createAccount.processing,
    emailIds: state.createAccount.emailIds,
    newAccount: state.createAccount.newAccount,
    coreData: state.createAccount.coreData
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
