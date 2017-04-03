import { connect } from 'react-redux';
import CreateAccount from '../components/create_account';
import { createAccount, createAccountError } from '../actions/create_account_actions';

const mapStateToProps = state => {
  return {
    error: state.createAccount.error
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createAccountError: error => (dispatch(createAccountError(error))),
    createAccount: emailId => (dispatch(createAccount(emailId))),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount);
