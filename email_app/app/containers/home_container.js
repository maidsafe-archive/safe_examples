import { connect } from 'react-redux';
import Home from '../components/home';
import { reconnectApplication, refreshEmail, getEmailIds } from '../actions/initialiser_actions';
import { resetCurrentAccount } from '../actions/create_account_actions';

const mapStateToProps = state => {
  return {
    coreData: state.initialiser.coreData,
    account: state.initialiser.account,
    inboxSize: state.initialiser.inboxSize,
    savedSize: state.initialiser.savedSize,
    networkStatus: state.initialiser.networkStatus,
    processing: state.initialiser.processing
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
