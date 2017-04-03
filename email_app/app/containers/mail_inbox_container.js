import { connect } from 'react-redux';
import MailInbox from '../components/mail_inbox';
import { setMailProcessing, clearMailProcessing, setActiveMail, clearInbox } from '../actions/mail_actions';

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
    setMailProcessing: () => (dispatch(setMailProcessing())),
    clearMailProcessing: () => (dispatch(clearMailProcessing())),
    setActiveMail: data => (dispatch(setActiveMail(data))),
    clearInbox: _ => (dispatch(clearInbox())),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MailInbox);
