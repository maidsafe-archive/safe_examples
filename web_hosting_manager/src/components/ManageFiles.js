// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import WizardNav from './WizardNav';
import FileExplorer from './FileExplorer';
import Base from './_Base';
import { decodeURI } from '../utils/app';

export default class ManageFiles extends Component {
  componentWillMount() {
    const { publicName, containerPath } = this.props.match.params;
    this.props.checkAndFetchContainer(publicName, decodeURI(containerPath));
  }

  componentDidUpdate() {
    if (!this.props.authorisingMD && this.props.authorisedMD) {
      const { containerPath } = this.props.match.params;
      this.props.reset();
      this.props.getContainerInfo(decodeURI(containerPath));
    }
  }

  componentWillUnmount() {
    this.props.reset();
  }

  popupOkCb() {
    if (this.props.sendAuthReq) {
      this.props.sendMDAuthReq(this.props.match.params.publicName);
      return;
    }
    this.props.reset();
  }

  popupCancelCb() {
    if (this.props.sendAuthReq) {
      this.props.cancelMDReq();
      return this.props.history.push('/publicNames');
    }
  }

  render() {
    const containerPath = decodeURI(this.props.match.params.containerPath);
    return (
      <Base
        showAuthReq={this.props.sendAuthReq}
        reconnect={this.props.reconnect}
        nwState={this.props.nwState}
        processing={this.props.processing}
        error={this.props.error}
        processDesc={this.props.processDesc}
        popupOkCb={this.popupOkCb.bind(this)}
        popupCancelCb={this.popupCancelCb.bind(this)}
      >
        <div>
          <WizardNav history={this.props.history} />
          <div className="card">
            <div className="card-b">
              <h3 className="h type-center">{containerPath}</h3>
              <div className="cntr">
                <FileExplorer {...this.props} rootPath={containerPath} />
              </div>
            </div>
          </div>
        </div>
      </Base>
    );
  }
}

ManageFiles.propTypes = {
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  processDesc: PropTypes.string.isRequired,
  error: PropTypes.string.isRequired,
  nwState: PropTypes.string.isRequired,
  processing: PropTypes.bool.isRequired,
  sendAuthReq: PropTypes.bool.isRequired,
  authorisingMD: PropTypes.bool.isRequired,
  authorisedMD: PropTypes.bool.isRequired,
  reconnect: PropTypes.func.isRequired,
  cancelMDReq: PropTypes.func.isRequired,
  sendMDAuthReq: PropTypes.func.isRequired,
  getContainerInfo: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  checkAndFetchContainer: PropTypes.func.isRequired,
};
