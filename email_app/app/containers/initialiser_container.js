import { connect } from 'react-redux';
import Initializer from '../components/initialiser';
import { setInitialiserTask, authoriseApplication } from '../actions';

const mapStateToProps = state => ({
  appStatus: state.initialiser.appStatus,
  app: state.initialiser.app,
  tasks: state.initialiser.tasks
});

const mapDispatchToProps = dispatch => ({
  setInitialiserTask: (task) => (dispatch(setInitialiserTask(task))),
  authoriseApplication: () => (dispatch(authoriseApplication()))
});

export default connect(mapStateToProps, mapDispatchToProps)(Initializer);
