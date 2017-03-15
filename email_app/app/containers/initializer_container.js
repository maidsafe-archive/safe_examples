import { connect } from 'react-redux';
import Initializer from '../components/initializer';
import { setInitializerTask, authoriseApplication } from '../actions/initializer_actions';
import { getConfigFile, writeConfigFile } from '../actions/nfs_actions';
import { createStructuredData, fetchStructuredData, fetchStructuredDataHandle, putStructuredData, dropStructuredDataHandle } from '../actions/structured_data_actions';
import { getStructuredDataIdHandle } from '../actions/data_id_handle_actions';
import { getCipherOptsHandle, deleteCipherOptsHandle } from '../actions/cipher-opts_actions';

const mapStateToProps = state => {
  return {
    client: state.initializer.client,
    tasks: state.initializer.tasks,
    config: state.initializer.config,
    coreData: state.initializer.coreData
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setInitializerTask: task => (dispatch(setInitializerTask(task))),
    authoriseApplication: payload => (dispatch(authoriseApplication(payload))),
    getConfigFile: (client) => (dispatch(getConfigFile(client))),
    writeConfigFile: (client, data) => (dispatch(writeConfigFile(client, data))),
    getCipherOptsHandle: (client, encType, keyHandle) => (dispatch(getCipherOptsHandle(client, encType, keyHandle))),
    deleteCipherOptsHandle: (client, handleId) => (dispatch(deleteCipherOptsHandle(client, handleId))),
    getStructuredDataIdHandle: (client, name, typeTag) => (dispatch(getStructuredDataIdHandle(client, name, typeTag))),
    createStructuredData: (client, name, data) => (dispatch(createStructuredData(client, name, data))),
    fetchStructuredData: (client, handleId) => (dispatch(fetchStructuredData(client, handleId))),
    fetchStructuredDataHandle: (client, dataIdHandle) => (dispatch(fetchStructuredDataHandle(client, dataIdHandle))),
    putStructuredData: (client, handleId) => (dispatch(putStructuredData(client, handleId))),
    dropStructuredDataHandle: (client, handleId) => (dispatch(dropStructuredDataHandle(client, handleId)))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Initializer);
