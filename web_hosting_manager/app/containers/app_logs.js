import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AppLogs from '../components/app_logs';
import * as commonAction from '../actions/common';

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...commonAction,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AppLogs);
