import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Initialiser from '../components/initialiser';
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

export default connect(mapStateToProps, mapDispatchToProps)(Initialiser);
