import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ManageFiles from '../components/ManageFiles';
import * as fileMangerAction from '../actions/file_manager';
import * as commonAction from '../actions/common';

function mapStateToProps(state) {
  return {
    uploading: state.fileManager.uploading,
    uploadStatus: state.fileManager.uploadStatus,
    error: state.fileManager.error,
    processing: state.fileManager.processing,
    processDesc: state.fileManager.processDesc,
    containerInfo: state.fileManager.containerInfo
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...commonAction,
    ...fileMangerAction
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageFiles);
