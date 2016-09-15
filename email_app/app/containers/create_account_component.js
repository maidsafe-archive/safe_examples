import { connect } from 'react-redux';
import CreateAccount from '../components/create_account';
import { createAppendableData, setAppendableDataId } from '../actions/appendable_data_actions';
import { updateCoreStructure } from '../actions/core_structure_actions';
import { setCreateAccountError, setCreateAccountProcessing } from '../actions/create_account_actions';
import { dropHandler } from '../actions/data_handle_actions';

const mapStateToProps = state => {
  return {
    token: state.initializer.token,
    coreDataHandler: state.initializer.coreDataHandler,
    coreData: state.initializer.coreData,
    authorised: state.createAccount.authorised,
    processing: state.createAccount.processing,
    error: state.createAccount.error
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createAppendableData: (token, id) => (dispatch(createAppendableData(token, id))),
    setAppendableDataId: id => (dispatch(setAppendableDataId(id))),
    updateCoreStructure: (token, id, data) => (dispatch(updateCoreStructure(token, id, data))),
    setCreateAccountError: error => (dispatch(setCreateAccountError(error))),
    setCreateAccountProcessing: () => (dispatch(setCreateAccountProcessing())),
    dropHandler: (token, handleId) => (dispatch(dropHandler(token, handleId)))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount);
