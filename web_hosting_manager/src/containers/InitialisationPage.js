import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Initialisation from '../components/Initialisation';
import * as initialisationAction from '../actions/initialisation';
import * as commonAction from '../actions/common';

function mapStateToProps(state) {
  return {
    ...state.initialisation,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...initialisationAction, ...commonAction }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Initialisation);
