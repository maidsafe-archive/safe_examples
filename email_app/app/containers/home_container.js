import { connect } from 'react-redux';
import Home from '../components/home';
import { reconnectApplication, refreshEmail, getEmailIds } from '../actions/initializer_actions';
import { resetCurrentAccount } from '../actions/create_account_actions';

const mapStateToProps = state => {
  return {
    coreData: state.initializer.coreData,
    account: state.initializer.account,
    inboxSize: state.initializer.inboxSize,
    savedSize: state.initializer.savedSize,
    networkStatus: state.initializer.networkStatus,
    processing: state.initializer.processing
  };
};

const mapDispatchToProps = dispatch => {
  return {
    reconnectApplication: () => (dispatch(reconnectApplication())),
    refreshEmail: (account) => (dispatch(refreshEmail(account))),
    getEmailIds: () => (dispatch(getEmailIds())),
    resetCurrentAccount: () => (dispatch(resetCurrentAccount()))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
