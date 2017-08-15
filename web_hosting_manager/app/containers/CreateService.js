// @flow

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import CreateService from '../components/CreateService';
import * as AppActions from '../actions/app';

const mapStateToProps = (state) => {
  return {
    isConnecting: state.connection.isConnecting,
    isConnected: state.connection.isConnected,
    connectionError: state.connection.error,
    creatingService: state.service.creatingService,
    serviceError: state.service.error,
    serviceErrorCode: state.service.errorCode,
    isMDAuthorising: state.service.isMDAuthorising,
    isMDAuthorised: state.service.isMDAuthorised,
    isMDAuthorisedAck: state.service.isMDAuthorisedAck,
    fetchingPublicContainers: state.containers.fetchingPublicContainers,
    publicContainers: state.containers.publicContainers,
    publicContainersError: state.containers.error,
    isRevoked: state.auth.isRevoked
  };
};

const mapActionsToProps = (dispatch) => {
  return bindActionCreators(AppActions, dispatch);
};

export default connect(mapStateToProps, mapActionsToProps)(CreateService);
