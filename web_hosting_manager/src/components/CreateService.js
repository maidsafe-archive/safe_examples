// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CONSTANTS from '../constants';
import Base from './_Base';
import WizardNav from './WizardNav';
import ErrorComp from './_Error';
import * as utils from '../utils/app';

export default class CreateService extends Component {
  constructor() {
    super();
    this.state = {
      error: '',
    };
  }
  componentWillMount() {
    this.props.canAccessPublicName(this.props.match.params.publicName);
  }

  componentDidMount() {
    if (this.serviceName) {
      this.serviceName.focus();
    }
  }

  componentDidUpdate() {
    const { publicName, option } = this.props.match.params;
    const serviceName = this.serviceName.value.trim();

    if (this.props.checkedServiceExists) {
      if (this.props.serviceExists) {
        return;
      }
      // if service not exist navigate, go next step
      switch (option) {
        case CONSTANTS.UI.NEW_WEBSITE_OPTIONS.CHOOSE_EXISTING:
          return this.props.history.push(`/chooseExistingContainer/${publicName}/${serviceName}`);
        case CONSTANTS.UI.NEW_WEBSITE_OPTIONS.FROM_SCRATCH:
          return this.props.history.push(`/createServiceContainer/${publicName}/${serviceName}`);
        case CONSTANTS.UI.NEW_WEBSITE_OPTIONS.TEMPLATE:
          return this.props.history.push(`/withTemplate/${publicName}/${serviceName}`);
        default:
          console.error('Unknown option provided for creating service');
      }
    }
  }

  componentWillUnmount() {
    this.props.reset();
  }

  handleNext(e) {
    e.preventDefault();
    const { publicName } = this.props.match.params;
    const serviceName = this.serviceName.value.trim();

    if (!serviceName) {
      return;
    }

    if (!utils.domainCheck(serviceName)) {
      return this.setState({
        error: CONSTANTS.UI.ERROR_MSG.INVALID_SERVICE_NAME,
      });
    }
    this.setState({ error: '' });

    this.props.checkServiceExists(publicName, serviceName);
  }

  popupOkCb() {
    if (this.props.sendAuthReq) {
      this.props.sendMDAuthReq(this.props.match.params.publicName);
      return;
    }
    this.props.reset();
  }

  popupCancelCb() {
    const { publicName } = this.props.match.params;

    if (this.props.sendAuthReq) {
      this.props.cancelMDReq();
      return this.props.history.push(`/newWebSite/${publicName}`);
    }
  }

  render() {
    const { publicName } = this.props.match.params;
    return (
      <Base
        reconnect={this.props.reconnect}
        nwState={this.props.nwState}
        showAuthReq={this.props.sendAuthReq}
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
              <h3 className="h">Choose a name for your service (website):</h3>
              <div className="cntr">
                <div className="create-service">
                  <div className="b">
                    <div className="protocol">safe://</div>
                    <div className="inpt">
                      <input
                        type="text"
                        name="service-name"
                        placeholder="Service Name"
                        onKeyPress={(e) => {
                          if (e.charCode === 13) {
                            this.handleNext(e);
                          }
                        }}
                        ref={(c) => { this.serviceName = c; }}
                      />
                    </div>
                    <div className="public-id">.{publicName}</div>
                  </div>
                  {
                    this.state.error ?
                      ErrorComp(<span className="err-msg">{this.state.error}</span>) : null
                  }
                </div>
              </div>
              <div className="opts">
                <div className="opt">
                  <button
                    type="button"
                    className="btn flat"
                    onClick={(e) => {
                      e.preventDefault();
                      this.props.history.push(`/newWebSite/${publicName}`);
                    }}
                  >Cancel
                  </button>
                </div>
                <div className="opt">
                  <button
                    type="button"
                    className="btn flat primary"
                    onClick={this.handleNext.bind(this)}
                  >Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Base>
    );
  }
}

CreateService.propTypes = {
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  nwState: PropTypes.string.isRequired,
  processDesc: PropTypes.string.isRequired,
  error: PropTypes.string.isRequired,
  processing: PropTypes.bool.isRequired,
  sendAuthReq: PropTypes.bool.isRequired,
  serviceExists: PropTypes.bool.isRequired,
  checkedServiceExists: PropTypes.bool.isRequired,
  reconnect: PropTypes.func.isRequired,
  cancelMDReq: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  sendMDAuthReq: PropTypes.func.isRequired,
  checkServiceExists: PropTypes.func.isRequired,
  canAccessPublicName: PropTypes.func.isRequired,
};
