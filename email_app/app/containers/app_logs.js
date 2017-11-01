import { connect } from 'react-redux';
import AppLogs from '../components/app_logs';
import { getLogPath } from '../actions';

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
    getLogPath: () => (dispatch(getLogPath()))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AppLogs);
