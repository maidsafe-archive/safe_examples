import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import CreateService from '../components/CreateService';
import { canAccessPublicName } from '../actions/public_names';
import * as serviceAction from '../actions/services';
import * as commonAction from '../actions/common';

function mapStateToProps(state) {
  return {
    nwState: state.initialisation.nwState,
    error: state.services.error,
    processing: state.services.processing,
    processDesc: state.services.processDesc,
    checkedServiceExists: state.services.checkedServiceExists,
    sendAuthReq: state.services.sendAuthReq,
    serviceExists: state.services.serviceExists
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...serviceAction,
    ...commonAction,
    canAccessPublicName
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateService);
