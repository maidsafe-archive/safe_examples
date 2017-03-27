import { connect } from 'react-redux';
import MailInbox from '../components/mail_inbox';
import { setMailProcessing, clearMailProcessing } from '../actions/mail_actions';

const mapStateToProps = state => {
  return {
    coreData: state.initializer.coreData,
    rootSDHandle: state.initializer.rootSDHandle,
    inboxSize: state.initializer.inboxSize,
    processing: state.mail.processing,
    error: state.mail.error,
    token: state.initializer.token
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setMailProcessing: () => (dispatch(setMailProcessing())),
    clearMailProcessing: () => (dispatch(clearMailProcessing())),
    pushToInbox: data => (dispatch(pushToInbox(data))),
    clearInbox: _ => (dispatch(clearInbox())),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MailInbox);
