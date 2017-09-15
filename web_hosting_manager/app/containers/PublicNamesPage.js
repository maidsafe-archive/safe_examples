import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import PublicNames from '../components/PublicNames';
import * as publicNamesAction from '../actions/public_names';
import * as serviceNamesAction from '../actions/services';
import * as commonAction from '../actions/common';

function mapStateToProps(state) {
  return {
    nwState: state.initialisation.nwState,
    error: state.publicNames.error || state.services.error,
    processing: state.publicNames.processing || state.services.processing,
    processDesc: state.publicNames.processDesc || state.services.processDesc,
    publicNames: state.publicNames.publicNames
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...publicNamesAction,
    ...serviceNamesAction,
    ...commonAction
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PublicNames);
