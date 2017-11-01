import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import NewPublicName from '../components/NewPublicName';
import * as publicNamesAction from '../actions/public_names';
import * as commonAction from '../actions/common';

function mapStateToProps(state) {
  return {
    nwState: state.initialisation.nwState,
    error: state.publicNames.error,
    processing: state.publicNames.processing,
    processDesc: state.publicNames.processDesc,
    createdPublicName: state.publicNames.createdPublicName,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...publicNamesAction,
    ...commonAction,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(NewPublicName);
