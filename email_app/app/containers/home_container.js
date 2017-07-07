import { connect } from 'react-redux';
import Home from '../components/home';
import { reconnectApplication, refreshEmail } from '../actions/initializer_actions';

const mapStateToProps = state => {
  return {
    coreData: state.initializer.coreData,
    accounts: state.initializer.accounts,
    inboxSize: state.initializer.inboxSize,
    savedSize: state.initializer.savedSize,
    network_status: state.initializer.network_status,
    processing: state.initializer.processing
  };
};

const mapDispatchToProps = dispatch => {
  return {
    reconnectApplication: () => (dispatch(reconnectApplication())),
    refreshEmail: (account) => (dispatch(refreshEmail(account))),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
