import { connect } from 'react-redux';
import MailInbox from '../components/mail_inbox';
import { fetchAppendableData, fetchAppendableDataHandler, setAppendableDataId, deleteAppendableData, fetchDataIdAt, clearDeleteData, getAppendableDataLength } from '../actions/appendable_data_actions';
import { fetchMail } from '../actions/immutable_data_actions';
import { updateCoreStructure, fetchCoreStructure } from '../actions/core_structure_actions';
import { serialiseDataId, dropHandler } from '../actions/data_handle_actions';
import { pushToInbox, clearInbox } from '../actions/initializer_actions';
import { setMailProcessing, setActiveMail } from '../actions/mail_actions';

const mapStateToProps = state => {
  return {
    coreData: state.initializer.coreData,
    coreDataHandler: state.initializer.coreDataHandler,
    inboxSize: state.initializer.inboxSize,
    processing: state.mail.processing,
    error: state.mail.error,
    token: state.initializer.token,
    appendableDataId: state.initializer.appendableDataId
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearInbox: _ => (dispatch(clearInbox())),
    setMailProcessing: () => (dispatch(setMailProcessing())),
    setActiveMail: (data) => (dispatch(setActiveMail(data))),
    pushToInbox: data => (dispatch(pushToInbox(data))),
    setAppendableDataId: id => (dispatch(setAppendableDataId(id))),
    fetchAppendableData: (token, id) => (dispatch(fetchAppendableData(token, id))),
    fetchAppendableDataHandler: (token, id) => (dispatch(fetchAppendableDataHandler(token, id))),
    fetchCoreStructure: (token, handleId) => (dispatch(fetchCoreStructure(token, handleId))),
    fetchMail: (token, id) => (dispatch(fetchMail(token, id))),
    updateCoreStructure: (token, coreData, mail) => (dispatch(updateCoreStructure(token, coreData, mail))),
    serialiseDataId: (token, id) => (dispatch(serialiseDataId(token, id))),
    fetchDataIdAt: (token, handlerId, index) => (dispatch(fetchDataIdAt(token, handlerId, index))),
    deleteAppendableData: (token, handlerId, index) => (dispatch(deleteAppendableData(token, handlerId, index))),
    clearDeleteData: (token, handlerId) => (dispatch(clearDeleteData(token, handlerId))),
    getAppendableDataLength: (token, handlerId) => (dispatch(getAppendableDataLength(token, handlerId))),
    dropHandler: (token, handleId) => dispatch(dropHandler(token, handleId))
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MailInbox);
