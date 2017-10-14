import { connect } from 'react-redux';
import Initializer from '../components/initialiser';
import { setInitialiserTask, authoriseApplication, getEmailIds } from '../actions';

const mapStateToProps = state => {
  return {
    appStatus: state.emailApp.appStatus,
    app: state.emailApp.app,
    tasks: state.emailApp.tasks
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setInitialiserTask: (task) => (dispatch(setInitialiserTask(task))),
    authoriseApplication: () => (dispatch(authoriseApplication())),
    getEmailIds: () => (dispatch(getEmailIds()))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Initializer);
