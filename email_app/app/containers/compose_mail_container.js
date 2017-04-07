import { connect } from 'react-redux';
import ComposeMail from '../components/compose_mail';
import { cancelCompose, sendEmail, clearMailProcessing } from '../actions/mail_actions';

const mapStateToProps = state => {
  return {
    app: state.initializer.app,
    fromMail: state.initializer.coreData.id,
    error: state.mail.error,
    processing: state.mail.processing
  };
};

const mapDispatchToProps = dispatch => {
  return {
    sendEmail: (email, to) => (dispatch(sendEmail(email, to))),
    clearMailProcessing: _ => (dispatch(clearMailProcessing())),
    cancelCompose: _ => dispatch(cancelCompose()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ComposeMail);
