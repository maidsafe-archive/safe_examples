import { connect } from 'react-redux';
import MailSaved from '../components/mail_saved';
import { deleteSavedEmail } from '../actions/mail_actions';
import { refreshEmail } from '../actions/initializer_actions';

const mapStateToProps = state => {
  return {
    coreData: state.initializer.coreData,
    processing: state.mail.processing,
    error: state.mail.error,
    app: state.initializer.app,
    accounts: state.initializer.accounts
  };
};

const mapDispatchToProps = dispatch => {
  return {
    refreshEmail: (account) => (dispatch(refreshEmail(account))),
    deleteSavedEmail: (account, key) => (dispatch(deleteSavedEmail(account, key)))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MailSaved);
