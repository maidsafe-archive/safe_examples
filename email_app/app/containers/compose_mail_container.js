import { connect } from 'react-redux';
import ComposeMail from '../components/compose_mail';
import { fetchAppendableDataHandle, appendAppendableData, getEncryptedKey, deleteEncryptedKey, dropAppendableDataHandle } from '../actions/appendable_data_actions';
import { getCipherOptsHandle, deleteCipherOptsHandle } from '../actions/cipher-opts_actions';
import { createImmutableDataWriterHandle, writeImmutableData, putImmutableData, closeImmutableDataWriter } from '../actions/immutable_data_actions';
import { getAppendableDataIdHandle, dropHandler } from '../actions/data_id_handle_actions';
import { cancelCompose, setMailProcessing, clearMailProcessing } from '../actions/mail_actions';

const mapStateToProps = state => {
  return {
    token: state.initializer.token,
    fromMail: state.initializer.coreData.id,
    error: state.mail.error,
    processing: state.mail.processing
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setMailProcessing: _ => (dispatch(setMailProcessing())),
    clearMailProcessing: _ => (dispatch(clearMailProcessing())),
    cancelCompose: _ => dispatch(cancelCompose()),
    getAppendableDataIdHandle: (token, name) => (dispatch(getAppendableDataIdHandle(token, name))),
    dropHandler: (token, id) => (dispatch(dropHandler(token, id))),
    fetchAppendableDataHandle: (token, id) => (dispatch(fetchAppendableDataHandle(token, id))),
    getEncryptedKey: (token, handleId) => dispatch(getEncryptedKey(token, handleId)),
    deleteEncryptedKey: (token, handleId) => dispatch(deleteEncryptedKey(token, handleId)),
    getCipherOptsHandle: (token, encType, keyHandle) => (dispatch(getCipherOptsHandle(token, encType, keyHandle))),
    deleteCipherOptsHandle: (token, handleId) => (dispatch(deleteCipherOptsHandle(token, handleId))),
    createImmutableDataWriterHandle: (token) => (dispatch(createImmutableDataWriterHandle(token))),
    writeImmutableData : (token, handleId, data) => (dispatch(writeImmutableData(token, handleId, data))),
    putImmutableData: (token, handleId, cipherHandle) => (dispatch(putImmutableData(token, handleId, cipherHandle))),
    closeImmutableDataWriter: (token, handleId) => (dispatch(closeImmutableDataWriter(token, handleId))),
    appendAppendableData: (token, id, dataId) => (
      dispatch(appendAppendableData(token, id, dataId))
    ),
    dropAppendableDataHandle: (token, handleId) => (dispatch(dropAppendableDataHandle(token, handleId)))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ComposeMail);
