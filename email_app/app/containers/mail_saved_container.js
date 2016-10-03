import { connect } from 'react-redux';
import MailSaved from '../components/mail_saved';
import { updateStructuredData, fetchStructuredData, postStructuredData } from '../actions/structured_data_actions';
import { setMailProcessing } from '../actions/mail_actions';
import { getAppendableDataIdHandle, dropHandler } from '../actions/data_id_handle_actions';
import { fetchAppendableDataHandle, removeFromAppendableData, clearDeletedData, dropAppendableDataHandle } from '../actions/appendable_data_actions';
import { getCipherOptsHandle, deleteCipherOptsHandle } from '../actions/cipher-opts_actions';

const mapStateToProps = state => {
  return {
    token: state.initializer.token,
    rootSDHandle: state.initializer.rootSDHandle,
    coreData: state.initializer.coreData,
    processing: state.mail.processing,
    error: state.mail.error
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setMailProcessing: () => (dispatch(setMailProcessing())),
    getAppendableDataIdHandle: (token, name) => (dispatch(getAppendableDataIdHandle(token, name))),
    dropHandler: (token, handleId) => (dispatch(dropHandler(token, handleId))),
    fetchAppendableDataHandle: (token, dataHandleId) => (dispatch(fetchAppendableDataHandle(token, dataHandleId))),
    removeFromAppendableData: (token, handleId, index) => (dispatch(removeFromAppendableData(token, handleId, index))),
    dropAppendableDataHandle: (token, handlerId) => (dispatch(dropAppendableDataHandle(token, handlerId))),
    clearDeletedData: (token, handlerId) => (dispatch(clearDeletedData(token, handlerId))),
    updateStructuredData: (token, handleId, data, cipherOpts) => (dispatch(updateStructuredData(token, handleId, data, cipherOpts))),
    fetchStructuredData: (token, handleId) => (dispatch(fetchStructuredData(token, handleId))),
    postStructuredData: (token, handleId) => (dispatch(postStructuredData(token, handleId))),
    getCipherOptsHandle: (token, encType, keyHandle) => (dispatch(getCipherOptsHandle(token, encType, keyHandle))),
    deleteCipherOptsHandle: (token, handleId) => (dispatch(deleteCipherOptsHandle(token, handleId)))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MailSaved);
