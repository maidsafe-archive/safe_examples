import { connect } from 'react-redux';
import Home from '../components/home';
import { reconnectApplication, refreshEmail, getEmailIds } from '../actions/initialiser_actions';
import { resetCurrentAccount } from '../actions/create_account_actions';

const mapStateToProps = state => {
  return {
    coreData: state.createAccount.coreData,
    account: state.mail.account,
    inboxSize: state.mail.inboxSize,
    savedSize: state.mail.savedSize,
    networkStatus: state.initialiser.networkStatus,
    processing: state.mail.processing
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
