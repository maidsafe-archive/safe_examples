import { connect } from 'react-redux';
import Home from '../components/home';
import { reconnectApplication } from '../actions/initializer_actions';

const mapStateToProps = state => {
  return {
    coreData: state.initializer.coreData,
    inboxSize: state.initializer.inboxSize,
    savedSize: state.initializer.savedSize,
    network_status: state.initializer.network_status
  };
};

const mapDispatchToProps = dispatch => {
  return {
    reconnectApplication: () => (dispatch(reconnectApplication())),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
