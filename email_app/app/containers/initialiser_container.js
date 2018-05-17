import { connect } from 'react-redux';
import Initializer from '../components/initialiser';
import { setInitialiserTask, authoriseApplication, initialiseApplication } from '../actions';

const mapStateToProps = state => {
  return {
    appStatus: state.initialiser.appStatus,
    app: state.initialiser.app,
    tasks: state.initialiser.tasks
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setInitialiserTask: (task) => (dispatch(setInitialiserTask(task))),
    authoriseApplication: () => (dispatch(authoriseApplication())),
    initialiseApplication: () => (dispatch(initialiseApplication()))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Initializer);
