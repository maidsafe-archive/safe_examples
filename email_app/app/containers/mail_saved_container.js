import { connect } from 'react-redux';
import MailSaved from '../components/mail_saved';
import { deleteEmail } from '../actions/mail_actions';
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
    deleteEmail: (account, key) => (dispatch(deleteEmail(account, key)))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MailSaved);
