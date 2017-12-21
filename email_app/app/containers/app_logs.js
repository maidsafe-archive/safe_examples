import { connect } from 'react-redux';
import AppLogs from '../components/app_logs';
import { getLogPath } from '../actions';

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  getLogPath: () => (dispatch(getLogPath()))
});

export default connect(mapStateToProps, mapDispatchToProps)(AppLogs);
