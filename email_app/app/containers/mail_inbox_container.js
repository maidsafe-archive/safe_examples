import { connect } from 'react-redux';
import MailInbox from '../components/mail_inbox';
import { refreshInbox, clearMailProcessing, deleteEmail, archiveEmail } from '../actions/mail_actions';
import { refreshEmail } from '../actions/initializer_actions';

const mapStateToProps = state => {
  return {
    processing: state.mail.processing,
    error: state.mail.error,
    coreData: state.initializer.coreData,
    inboxSize: state.initializer.inboxSize,
    savedSize: state.initializer.savedSize,
    app: state.initializer.app,
    accounts: state.initializer.accounts
  };
};

const mapDispatchToProps = dispatch => {
  return {
    refreshEmail: (account) => (dispatch(refreshEmail(account))),
    deleteEmail: (account, key) => (dispatch(deleteEmail(account, key))),
    clearMailProcessing: () => (dispatch(clearMailProcessing())),
    archiveEmail: (account, key) => (dispatch(archiveEmail(account, key)))
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MailInbox);
