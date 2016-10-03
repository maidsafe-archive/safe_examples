import { connect } from 'react-redux';
import MailInbox from '../components/mail_inbox';
import {
  fetchAppendableDataMeta,
  fetchAppendableDataHandle,
  fetchDataIdAt,
  removeFromAppendableData,
  clearDeleteData,
  postAppendableData,
  getAppendableDataLength,
  dropAppendableDataHandle,
  clearDeletedData
} from '../actions/appendable_data_actions';
import { getImmutableDataReadHandle, readImmutableData, closeImmutableDataReader } from '../actions/immutable_data_actions';
import { updateStructuredData, fetchStructuredData, postStructuredData } from '../actions/structured_data_actions';
import { getAppendableDataIdHandle, dropHandler } from '../actions/data_id_handle_actions';
import { pushToInbox, clearInbox } from '../actions/initializer_actions';
import { setMailProcessing, clearMailProcessing } from '../actions/mail_actions';
import { getCipherOptsHandle, deleteCipherOptsHandle } from '../actions/cipher-opts_actions';

const mapStateToProps = state => {
  return {
    coreData: state.initializer.coreData,
    rootSDHandle: state.initializer.rootSDHandle,
    inboxSize: state.initializer.inboxSize,
    processing: state.mail.processing,
    error: state.mail.error,
    token: state.initializer.token
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setMailProcessing: () => (dispatch(setMailProcessing())),
    clearMailProcessing: () => (dispatch(clearMailProcessing())),
    pushToInbox: data => (dispatch(pushToInbox(data))),
    clearInbox: _ => (dispatch(clearInbox())),
    getAppendableDataIdHandle: (token, name) => (dispatch(getAppendableDataIdHandle(token, name))),
    dropHandler: (token, handleId) => dispatch(dropHandler(token, handleId)),
    fetchAppendableDataHandle: (token, dataIdHandle) => (dispatch(fetchAppendableDataHandle(token, dataIdHandle))),
    fetchAppendableDataMeta: (token, handleId) => (dispatch(fetchAppendableDataMeta(token, handleId))),
    fetchDataIdAt: (token, handlerId, index) => (dispatch(fetchDataIdAt(token, handlerId, index))),
    removeFromAppendableData: (token, handlerId, index) => (dispatch(removeFromAppendableData(token, handlerId, index))),
    getAppendableDataLength: (token, handlerId) => (dispatch(getAppendableDataLength(token, handlerId))),
    clearDeletedData: (token, handlerId) => (dispatch(clearDeletedData(token, handlerId))),
    postAppendableData: (token, handlerId) => (dispatch(postAppendableData(token, handlerId))),
    dropAppendableDataHandle: (token, handlerId) => (dispatch(dropAppendableDataHandle(token, handlerId))),
    updateStructuredData: (token, handleId, data, cipherOpts) => (dispatch(updateStructuredData(token, handleId, data, cipherOpts))),
    postStructuredData: (token, handleId) => (dispatch(postStructuredData(token, handleId))),
    fetchStructuredData: (token, handleId) => (dispatch(fetchStructuredData(token, handleId))),
    getImmutableDataReadHandle: (token, handleId) => (dispatch(getImmutableDataReadHandle(token, handleId))),
    readImmutableData: (token, handleId) => (dispatch(readImmutableData(token, handleId))),
    closeImmutableDataReader: (token, handleId) => (dispatch(closeImmutableDataReader(token, handleId))),
    getCipherOptsHandle: (token, encType, keyHandle) => (dispatch(getCipherOptsHandle(token, encType, keyHandle))),
    deleteCipherOptsHandle: (token, handleId) => (dispatch(deleteCipherOptsHandle(token, handleId)))
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MailInbox);
