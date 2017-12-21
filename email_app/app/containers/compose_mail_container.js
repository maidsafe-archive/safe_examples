import { connect } from 'react-redux';
import ComposeMail from '../components/compose_mail';
import { cancelCompose, sendEmail } from '../actions';

const mapStateToProps = state => ({
  app: state.emailApp.app,
  fromMail: state.emailApp.coreData.id,
  error: state.emailApp.error,
  processing: state.emailApp.processing
});

const mapDispatchToProps = dispatch => ({
  sendEmail: (email, to) => (dispatch(sendEmail(email, to))),
  cancelCompose: (_) => dispatch(cancelCompose())
});

export default connect(mapStateToProps, mapDispatchToProps)(ComposeMail);
