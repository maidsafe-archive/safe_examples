import { connect } from 'react-redux';
import Initializer from '../components/initializer';
import { setInitializerTask, authoriseApplication } from '../actions/initializer_actions';

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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Initializer);
