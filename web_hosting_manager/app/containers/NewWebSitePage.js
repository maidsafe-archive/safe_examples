import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import NewWebSite from '../components/NewWebSite';

function mapStateToProps(state) {
  return {
    nwState: state.initialisation.nwState
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(NewWebSite);
