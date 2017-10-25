import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ChooseExistingContainer from '../components/ChooseExistingContainer';
import * as publicNamesAction from '../actions/public_names';
import * as fileManagerAction from '../actions/file_manager';
import * as commonAction from '../actions/common';

function mapStateToProps(state) {
  return {
    nwState: state.initialisation.nwState,
    serviceContainers: state.publicNames.serviceContainers,
    error: state.publicNames.error || state.fileManager.error,
    processing: state.publicNames.processing || state.fileManager.processing,
    processDesc: state.publicNames.processDesc || state.fileManager.processDesc,
    published: state.fileManager.published,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...publicNamesAction,
    ...commonAction,
    publish: fileManagerAction.publish,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ChooseExistingContainer);
