import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ManageFiles from '../components/ManageFiles';
import * as serviceAction from '../actions/services';
import * as fileMangerAction from '../actions/file_manager';
import * as commonAction from '../actions/common';

function mapStateToProps(state) {
  return {
    nwState: state.initialisation.nwState,
    uploading: state.fileManager.uploading,
    uploadStatus: state.fileManager.uploadStatus,
    downloading: state.fileManager.downloading,
    downloadStatus: state.fileManager.downloadStatus,
    containerInfo: state.fileManager.containerInfo,
    error: state.fileManager.error || state.services.error,
    processing: state.fileManager.processing || state.services.processing,
    processDesc: state.fileManager.processDesc || state.services.processDesc,
    sendAuthReq: state.services.sendAuthReq,
    authorisedMD: state.services.authorisedMD,
    authorisingMD: state.services.authorisingMD
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...serviceAction,
    ...commonAction,
    ...fileMangerAction
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageFiles);
