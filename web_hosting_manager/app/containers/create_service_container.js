import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import CreateServiceContainer from '../components/create_service_container';
import * as publicNamesAction from '../actions/public_names';
import * as fileManagerAction from '../actions/file_manager';
import * as commonAction from '../actions/common';

function mapStateToProps(state) {
  return {
    nwState: state.initialiser.nwState,
    uploading: state.fileManager.uploading,
    uploadStatus: state.fileManager.uploadStatus,
    downloading: state.fileManager.downloading,
    downloadStatus: state.fileManager.downloadStatus,
    containerInfo: state.fileManager.containerInfo,
    published: state.fileManager.published,
    error: state.publicNames.error || state.fileManager.error,
    processing: state.publicNames.processing || state.fileManager.processing,
    processDesc: state.publicNames.processDesc || state.fileManager.processDesc,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...commonAction,
    ...publicNamesAction,
    ...fileManagerAction,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateServiceContainer);
