import { connect } from 'react-redux';
import MailInbox from '../components/mail_inbox';
import { refreshInbox, deleteEmail, saveEmail } from '../actions/mail_actions';
import { refreshEmail } from '../actions/initializer_actions';

const mapStateToProps = state => {
  return {
    error: state.mail.error,
    coreData: state.initializer.coreData,
    inboxSize: state.initializer.inboxSize,
    savedSize: state.initializer.savedSize,
    app: state.initializer.app,
    account: state.initializer.account
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
