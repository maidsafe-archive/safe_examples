import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Authorisation from '../components/Authorisation';
import * as authorisationAction from '../actions/authorisation';
import * as commonAction from '../actions/common';

function mapStateToProps(state) {
  return {
    nwState: state.initialisation.nwState,
    authorised: state.authorisation.authorised,
    error: state.authorisation.error,
    processing: state.authorisation.processing,
    processDesc: state.authorisation.processDesc,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...authorisationAction,
    ...commonAction,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Authorisation);
