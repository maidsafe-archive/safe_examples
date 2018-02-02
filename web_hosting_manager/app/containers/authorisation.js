import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Authorisation from '../components/authorisation';
import * as authorisationAction from '../actions/authorisation';
import * as commonAction from '../actions/common';

function mapStateToProps(state) {
  return {
    nwState: state.initialiser.nwState,
    authorised: state.authorisation.authorised,
    authorising: state.authorisation.authorising,
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
