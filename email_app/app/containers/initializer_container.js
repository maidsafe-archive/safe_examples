import { connect } from 'react-redux';
import Initializer from '../components/initializer';
import { setInitializerTask, authoriseApplication } from '../actions/initializer_actions';
import { getConfigFile, writeConfigFile } from '../actions/nfs_actions';
import { createCoreStructure, fetchCoreStructure, fetchCoreStructureHandler } from '../actions/core_structure_actions';
import { fetchAppendableDataHandler, setAppendableDataId } from '../actions/appendable_data_actions';

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
    setAuthorisedToken: token => (dispatch(setAuthorisedToken(token))),
    getConfigFile: (token) => (dispatch(getConfigFile(token))),
    writeConfigFile: (token, data) => (dispatch(writeConfigFile(token, data))),
    createCoreStructure: (token, id, data) => (dispatch(createCoreStructure(token, id, data))),
    fetchCoreStructure: (token, id) => (dispatch(fetchCoreStructure(token, id))),
    fetchAppendableDataHandler: (token, id) => (dispatch(fetchAppendableDataHandler(token, id))),
    setAppendableDataId: id => (dispatch(setAppendableDataId(id))),
    fetchCoreStructureHandler: (token, coreId) => (dispatch(fetchCoreStructureHandler(token, coreId)))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Initializer);
