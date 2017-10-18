import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import WithTemplate from '../components/WithTemplate';
import * as fileMangerAction from '../actions/file_manager';
import * as commonAction from '../actions/common';

function mapStateToProps(state) {
  return {
    nwState: state.initialisation.nwState,
    published: state.fileManager.published,
    uploading: state.fileManager.uploading,
    uploadStatus: state.fileManager.uploadStatus,
    error: state.fileManager.error,
    processing: state.fileManager.processing,
    processDesc: state.fileManager.processDesc,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...fileMangerAction,
    ...commonAction,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(WithTemplate);
