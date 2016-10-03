import { connect } from 'react-redux';
import CreateAccount from '../components/create_account';
import { createAppendableData, dropAppendableDataHandle, putAppendableData } from '../actions/appendable_data_actions';
import { updateStructuredData, postStructuredData } from '../actions/structured_data_actions';
import { getCipherOptsHandle, deleteCipherOptsHandle } from '../actions/cipher-opts_actions';
import { setCreateAccountError, setCreateAccountProcessing } from '../actions/create_account_actions';

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
    createAppendableData: (token, name) => (dispatch(createAppendableData(token, name))),
    putAppendableData: (token, id) => (dispatch(putAppendableData(token, id))),
    updateStructuredData: (token, handleId, data, cipherOpts) => (dispatch(updateStructuredData(token, handleId, data, cipherOpts))),
    postStructuredData: (token, handleId) => (dispatch(postStructuredData(token, handleId))),
    setCreateAccountError: error => (dispatch(setCreateAccountError(error))),
    setCreateAccountProcessing: () => (dispatch(setCreateAccountProcessing())),
    dropAppendableDataHandle: (token, handleId) => (dispatch(dropAppendableDataHandle(token, handleId))),
    getCipherOptsHandle: (token, encType, keyHandle) => (dispatch(getCipherOptsHandle(token, encType, keyHandle))),
    deleteCipherOptsHandle: (token, handleId) => (dispatch(deleteCipherOptsHandle(token, handleId)))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount);
