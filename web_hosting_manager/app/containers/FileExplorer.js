// @flow

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import FileExplorer from '../components/FileExplorer';
import * as AppActions from '../actions/app';

const mapStateToProps = (state) => {
  return {
    isConnecting: state.connection.isConnecting,
    isConnected: state.connection.isConnected,
    connectionError: state.connection.error,
    fetchingContainer: state.containers.fetchingContainer,
    containerInfo: state.containers.containerInfo,
    containerError: state.containers.error,
    deleting: state.containers.deleting,
    uploading: state.file.uploading,
    uploadStatus: state.file.uploadStatus,
    downloading: state.file.downloading,
    downloadProgress: state.file.downloadProgress,
    fileError: state.file.error
  };
};

const mapActionsToProps = (dispatch) => {
  return bindActionCreators(AppActions, dispatch);
};

export default connect(mapStateToProps, mapActionsToProps)(FileExplorer);
