import { connect } from 'react-redux';
import MailSaved from '../components/mail_saved';
import { setMailProcessing } from '../actions/mail_actions';

const mapStateToProps = state => {
  return {
    token: state.initializer.token,
    rootSDHandle: state.initializer.rootSDHandle,
    coreData: state.initializer.coreData,
    processing: state.mail.processing,
    error: state.mail.error
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setMailProcessing: () => (dispatch(setMailProcessing())),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MailSaved);
