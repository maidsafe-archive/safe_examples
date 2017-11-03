import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Initialiser from '../components/initialiser';
import * as initialiserAction from '../actions/initialiser';
import * as commonAction from '../actions/common';

function mapStateToProps(state) {
  return {
    ...state.initialiser,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...initialiserAction, ...commonAction }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Initialiser);
