import { connect } from 'react-redux';
import MailInbox from '../components/mail_inbox';
import { refreshInbox, deleteEmail, saveEmail, refreshEmail } from '../actions';

const mapStateToProps = state => {
  return {
    error: state.emailApp.error,
    coreData: state.emailApp.coreData,
    inboxSize: state.emailApp.inboxSize,
    savedSize: state.emailApp.savedSize,
    spaceUsed: state.emailApp.spaceUsed,
    app: state.initialiser.app,
    account: state.emailApp.account
  };
};

const mapDispatchToProps = dispatch => {
  return {
    refreshEmail: (account) => (dispatch(refreshEmail(account))),
    deleteEmail: (account, key) => (dispatch(deleteEmail(account, key))),
    saveEmail: (account, key) => (dispatch(saveEmail(account, key)))
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MailInbox);
