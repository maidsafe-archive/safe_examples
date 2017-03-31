import { connect } from 'react-redux';
import CreateAccount from '../components/create_account';
import { createAccount, createAccountError } from '../actions/create_account_actions';

const mapStateToProps = state => {
  return {
    token: state.initializer.token,
    rootSDHandle: state.initializer.rootSDHandle,
    coreData: state.initializer.coreData,
    authorised: state.createAccount.authorised,
    processing: state.createAccount.processing,
    error: state.createAccount.error
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createAccountError: error => (dispatch(createAccountError(error))),
    createAccount: () => (dispatch(createAccount())),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount);
