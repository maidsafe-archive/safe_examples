import { connect } from 'react-redux';
import Home from '../components/home';
import { reconnectApplication, refreshEmail, getEmailIds, resetCurrentAccount } from '../actions';

const mapStateToProps = state => ({
  coreData: state.emailApp.coreData,
  account: state.emailApp.account,
  inboxSize: state.emailApp.inboxSize,
  savedSize: state.emailApp.savedSize,
  networkStatus: state.initialiser.networkStatus,
  processing: state.initialiser.processing
});

const mapDispatchToProps = dispatch => ({
  reconnectApplication: () => (dispatch(reconnectApplication())),
  refreshEmail: (account) => (dispatch(refreshEmail(account))),
  getEmailIds: () => (dispatch(getEmailIds())),
  resetCurrentAccount: () => (dispatch(resetCurrentAccount()))
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
