import { connect } from 'react-redux';
import Initializer from '../components/initializer';
import { setInitializerTask, authoriseApplication } from '../actions/initializer_actions';
import { getConfigFile, writeConfigFile } from '../actions/nfs_actions';
import { createStructuredData, fetchStructuredData, fetchStructuredDataHandle, putStructuredData, dropStructuredDataHandle } from '../actions/structured_data_actions';
import { getStructuredDataIdHandle } from '../actions/data_id_handle_actions';
import { getCipherOptsHandle, deleteCipherOptsHandle } from '../actions/cipher-opts_actions';

const mapStateToProps = state => {
  return {
    token: state.initializer.token,
    tasks: state.initializer.tasks,
    config: state.initializer.config,
    coreData: state.initializer.coreData
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setInitializerTask: task => (dispatch(setInitializerTask(task))),
    authoriseApplication: payload => (dispatch(authoriseApplication(payload))),
    getConfigFile: (token) => (dispatch(getConfigFile(token))),
    writeConfigFile: (token, data) => (dispatch(writeConfigFile(token, data))),
    getCipherOptsHandle: (token, encType, keyHandle) => (dispatch(getCipherOptsHandle(token, encType, keyHandle))),
    deleteCipherOptsHandle: (token, handleId) => (dispatch(deleteCipherOptsHandle(token, handleId))),
    getStructuredDataIdHandle: (token, name) => (dispatch(getStructuredDataIdHandle(token, name))),
    createStructuredData: (token, name, data) => (dispatch(createStructuredData(token, name, data))),
    fetchStructuredData: (token, handleId) => (dispatch(fetchStructuredData(token, handleId))),
    fetchStructuredDataHandle: (token, dataIdHandle) => (dispatch(fetchStructuredDataHandle(token, dataIdHandle))),
    putStructuredData: (token, handleId) => (dispatch(putStructuredData(token, handleId))),
    dropStructuredDataHandle: (token, handleId) => (dispatch(dropStructuredDataHandle(token, handleId)))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Initializer);
