// @flow

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Home from '../components/Home';
import * as AppActions from '../actions/app';

const mapStateToProps = (state) => {
  return {
    isConnecting: state.connection.isConnecting,
    isConnected: state.connection.isConnected,
    connectionError: state.connection.error,
    fetchingAccessInfo: state.accessInfo.fetchingAccessInfo,
    fetchedAccessInfo: state.accessInfo.fetchedAccessInfo,
    accessInfoError: state.accessInfo.error,
    fetchingPublicNames: state.publicId.fetchingPublicNames,
    publicNames: state.publicId.publicNames,
    creatingPublicId: state.publicId.creatingPublicId,
    publicIdError: state.publicId.error,
    remapping: state.service.remapping,
    serviceError: state.service.error,
    publicContainers: state.containers.publicContainers,
    fetchingPublicContainers: state.containers.fetchingPublicContainers,
    isRevoked: state.auth.isRevoked
  };
};

const mapActionsToProps = (dispatch) => {
  return bindActionCreators(AppActions, dispatch);
};

export default connect(mapStateToProps, mapActionsToProps)(Home);
