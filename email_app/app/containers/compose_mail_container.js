import { connect } from 'react-redux';
import ComposeMail from '../components/compose_mail';
import { cancelCompose, setMailProcessing, clearMailProcessing } from '../actions/mail_actions';

const mapStateToProps = state => {
  return {
    token: state.initializer.token,
    fromMail: state.initializer.coreData.id,
    error: state.mail.error,
    processing: state.mail.processing
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setMailProcessing: _ => (dispatch(setMailProcessing())),
    clearMailProcessing: _ => (dispatch(clearMailProcessing())),
    cancelCompose: _ => dispatch(cancelCompose()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ComposeMail);
