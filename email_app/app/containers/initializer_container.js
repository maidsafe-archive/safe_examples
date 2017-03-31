import { connect } from 'react-redux';
import Initializer from '../components/initializer';
import { setInitializerTask, authoriseApplication, refreshConfig } from '../actions/initializer_actions';

const mapStateToProps = state => {
  return {
    client: state.initializer.client,
    accounts: state.initializer.accounts,
    tasks: state.initializer.tasks,
    config: state.initializer.config,
    coreData: state.initializer.coreData
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setInitializerTask: task => (dispatch(setInitializerTask(task))),
    authoriseApplication: (appInfo, permissions, opts) =>
                    (dispatch(authoriseApplication(appInfo, permissions, opts))),
    refreshConfig: mdata => (dispatch(refreshConfig(mdata)))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Initializer);
