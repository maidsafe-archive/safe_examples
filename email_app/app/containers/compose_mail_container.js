import { connect } from 'react-redux';
import ComposeMail from '../components/compose_mail';
import { cancelCompose, sendEmail } from '../actions/mail_actions';

const mapStateToProps = state => {
  return {
    app: state.initializer.app,
    fromMail: state.initializer.coreData.id,
    error: state.mail.error
  };
};

const mapDispatchToProps = dispatch => {
  return {
    sendEmail: (email, to) => (dispatch(sendEmail(email, to))),
    cancelCompose: (_) => dispatch(cancelCompose())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ComposeMail);
