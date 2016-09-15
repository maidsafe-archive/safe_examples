import { connect } from 'react-redux';
import ComposeMail from '../components/compose_mail';
import { fetchAppendableDataHandler, appendAppendableData, getEncryptedKey } from '../actions/appendable_data_actions';
import { updateCoreStructure } from '../actions/core_structure_actions';
import { createMail } from '../actions/immutable_data_actions';
import { serialiseDataId, dropHandler } from '../actions/data_handle_actions';
import { cancelCompose, setMailProcessing, clearMailProcessing } from '../actions/mail_actions';

const mapStateToProps = state => {
  return {
    token: state.initializer.token,
    coreData: state.initializer.coreData,
    coreDataHandler: state.initializer.coreDataHandler,
    fromMail: state.initializer.coreData.id,
    error: state.mail.error,
    processing: state.mail.processing
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearMailProcessing: _ => (dispatch(clearMailProcessing())),
    fetchAppendableDataHandler: (token, id) => (dispatch(fetchAppendableDataHandler(token, id))),
    dropAppendableData: (token, id) => (dispatch(dropHandler(token, id))),
    appendAppendableData: (token, id, dataId) => (
      dispatch(appendAppendableData(token, id, dataId))
    ),
    setMailProcessing: _ => (dispatch(setMailProcessing())),
    createMail: (token, data, encryptKeyHandler) => dispatch(createMail(token, data, encryptKeyHandler)),
    cancelCompose: _ => dispatch(cancelCompose()),
    getEncryptedKey: (token, handleId) => dispatch(getEncryptedKey(token, handleId)),
    serialiseDataId: (token, handlerId) => dispatch(serialiseDataId(token, handlerId)),
    updateCoreStructure: (token, id, data) => (dispatch(updateCoreStructure(token, id, data)))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ComposeMail);
