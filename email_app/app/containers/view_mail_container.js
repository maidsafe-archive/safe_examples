import { connect } from 'react-redux';
import ViewMail from '../components/view_mail';
import { fetchMail } from '../actions/immutable_data_actions';
import { updateCoreStructure } from '../actions/core_structure_actions';
import { setMailProcessing, setActiveMail } from '../actions/mail_actions';
import { deserialiseDataId, dropHandler } from '../actions/data_handle_actions';
import { fetchAppendableDataHandler, deleteAppendableData } from '../actions/appendable_data_actions';

const mapStateToProps = state => {
  return {
    token: state.initializer.token,
    coreDataHandler: state.initializer.coreDataHandler,
    coreData: state.initializer.coreData,
    processing: state.mail.processing,
    activeMail: state.mail.activeMail
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dropHandler: (token, handleId) => (dispatch(dropHandler(token, handleId))),
    deleteAppendableData: (token, handleId, index) => (dispatch(deleteAppendableData(token, handleId, index))),
    fetchAppendableDataHandler: (token, id) => (dispatch(fetchAppendableDataHandler(token, id))),
    fetchMail: (token, id) => (dispatch(fetchMail(token, id))),
    setMailProcessing: () => (dispatch(setMailProcessing())),
    setActiveMail: (data) => (dispatch(setActiveMail(data))),
    deserialiseDataId: (token, id) => (dispatch(deserialiseDataId(token, id))),
    updateCoreStructure: (token, id, data) => (dispatch(updateCoreStructure(token, id, data)))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewMail);
