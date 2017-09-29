import { connect } from 'react-redux';
import MailSaved from '../components/mail_saved';
import { deleteEmail } from '../actions/mail_actions';
import { refreshEmail } from '../actions/initialiser_actions';

const mapStateToProps = state => {
  return {
    coreData: state.initialiser.coreData,
    processing: state.mail.processing,
    error: state.mail.error,
    app: state.initialiser.app,
    account: state.initialiser.account
  };
};

const mapDispatchToProps = dispatch => {
  return {
    refreshEmail: (account) => (dispatch(refreshEmail(account))),
    deleteEmail: (account, key) => (dispatch(deleteEmail(account, key)))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MailSaved);
