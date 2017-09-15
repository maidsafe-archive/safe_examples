import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import CreateServiceContainer from '../components/CreateServiceContainer';
import * as publicNamesAction from '../actions/public_names';
import * as fileManagerAction from '../actions/file_manager';
import * as commonAction from '../actions/common';

function mapStateToProps(state) {
  return {
    uploading: state.fileManager.uploading,
    uploadStatus: state.fileManager.uploadStatus,
    containerInfo: state.fileManager.containerInfo,
    published: state.fileManager.published,
    error: state.publicNames.error || state.fileManager.error,
    processing: state.publicNames.processing || state.fileManager.processing,
    processDesc: state.publicNames.processDesc || state.fileManager.processDesc
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...commonAction,
    ...publicNamesAction,
    ...fileManagerAction
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateServiceContainer);
