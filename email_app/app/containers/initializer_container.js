import { connect } from 'react-redux';
import Initializer from '../components/initializer';
import { setInitializerTask, authoriseApplication, getEmailIds } from '../actions/initializer_actions';

const mapStateToProps = state => {
  return {
    app_status: state.initializer.app_status,
    app: state.initializer.app,
    tasks: state.initializer.tasks
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setInitializerTask: (task) => (dispatch(setInitializerTask(task))),
    authoriseApplication: () => (dispatch(authoriseApplication())),
    getEmailIds: () => (dispatch(getEmailIds()))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Initializer);
