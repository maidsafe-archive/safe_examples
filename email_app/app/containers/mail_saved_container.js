import { connect } from 'react-redux';
import MailSaved from '../components/mail_saved';
import { deleteEmail, refreshEmail } from '../actions';

const mapStateToProps = state => ({
  coreData: state.emailApp.coreData,
  processing: state.emailApp.processing,
  error: state.emailApp.error,
  app: state.emailApp.app,
  account: state.emailApp.account
});

const mapDispatchToProps = dispatch => ({
  refreshEmail: (account) => (dispatch(refreshEmail(account))),
  deleteEmail: (account, key) => (dispatch(deleteEmail(account, key)))
});

export default connect(mapStateToProps, mapDispatchToProps)(MailSaved);
