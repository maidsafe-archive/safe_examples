import { connect } from 'react-redux';
import MailInbox from '../components/mail_inbox';
import { refreshInbox, clearMailProcessing, setActiveMail } from '../actions/mail_actions';
import { refreshEmail } from '../actions/initializer_actions';

const mapStateToProps = state => {
  return {
    processing: state.mail.processing,
    error: state.mail.error,
    coreData: state.initializer.coreData,
    inboxSize: state.initializer.inboxSize,
    app: state.initializer.app,
    accounts: state.initializer.accounts
  };
};

const mapDispatchToProps = dispatch => {
  return {
    refreshEmail: (account) => (dispatch(refreshEmail(account))),
    clearMailProcessing: () => (dispatch(clearMailProcessing()))
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MailInbox);
