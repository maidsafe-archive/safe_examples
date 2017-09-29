import { connect } from 'react-redux';
import MailInbox from '../components/mail_inbox';
import { refreshInbox, deleteEmail, saveEmail } from '../actions/mail_actions';
import { refreshEmail } from '../actions/initialiser_actions';

const mapStateToProps = state => {
  return {
    error: state.mail.error,
    coreData: state.initialiser.coreData,
    inboxSize: state.initialiser.inboxSize,
    savedSize: state.initialiser.savedSize,
    spaceUsed: state.initialiser.spaceUsed,
    app: state.initialiser.app,
    account: state.initialiser.account
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
