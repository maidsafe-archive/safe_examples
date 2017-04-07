import { connect } from 'react-redux';
import MailSaved from '../components/mail_saved';
import { setMailProcessing } from '../actions/mail_actions';

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
    //setMailProcessing: () => (dispatch(setMailProcessing())),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MailSaved);
