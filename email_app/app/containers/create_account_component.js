import { connect } from 'react-redux';
import CreateAccount from '../components/create_account';

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
    setCreateAccountError: error => (dispatch(setCreateAccountError(error))),
    setCreateAccountProcessing: () => (dispatch(setCreateAccountProcessing())),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount);
