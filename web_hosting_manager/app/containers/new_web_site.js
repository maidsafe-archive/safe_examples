import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import NewWebSite from '../components/new_web_site';
import * as commonAction from '../actions/common';

function mapStateToProps(state) {
  return {
    nwState: state.initialiser.nwState,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(commonAction, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(NewWebSite);
