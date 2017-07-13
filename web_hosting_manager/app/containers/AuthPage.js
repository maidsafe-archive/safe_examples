// @flow

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Auth from '../components/Auth';
import * as AppActions from '../actions/app';

const mapStateToProps = (state) => {
  return {
    isAuthorising: state.auth.isAuthorising,
    isAuthorised: state.auth.isAuthorised,
    authError: state.auth.error,
    isRevoked: state.auth.isRevoked,
    isConnecting: state.connection.isConnecting,
    isConnected: state.connection.isConnected,
    connectionError: state.connection.error,
    fetchingAccessInfo: state.accessInfo.fetchingAccessInfo,
    fetchedAccessInfo: state.accessInfo.fetchedAccessInfo,
    accessInfoError: state.accessInfo.error,
    fetchingPublicNames: state.publicId.fetchingPublicNames,
    fetchedPublicNames: state.publicId.fetchedPublicNames,
    publicNameError: state.publicId.error,
    fetchingServices: state.service.fetchingServices,
    fetchedServices: state.service.fetchedServices,
    serviceError: state.service.error,
    fetchingPublicContainers: state.containers.fetchingPublicContainers,
    fetchedPublicContainers: state.containers.fetchedPublicContainers,
    publicContainersError: state.containers.error
  };
};

const mapActionsToProps = (dispatch) => {
  return bindActionCreators(AppActions, dispatch);
};

export default connect(mapStateToProps, mapActionsToProps)(Auth);
