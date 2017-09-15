// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import WizardNav from './WizardNav';
import FileExplorer from './FileExplorer';
import Base from './_Base';

export default class ManageFiles extends Component {
  componentDidMount() {
    this.props.getContainerInfo(decodeURIComponent(this.props.match.params.containerPath));
  }

  popupOkCb() {
    this.setState({
      showPopup: false
    });
  }

  popupOkCb() {
    this.props.reset();
  }

  componentWillUnmount() {
    this.props.reset();
  }

  render() {
    const containerPath = decodeURIComponent(this.props.match.params.containerPath);
    return (
      <Base
        processing={this.props.processing}
        error={this.props.error}
        processDesc={this.props.processDesc}
        popupOkCb={this.popupOkCb.bind(this)}
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
};
