// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Base from './_Base';
import WizardNav from './WizardNav';
import { genKey } from '../utils/app';

export default class ChooseExistingContainer extends Component {
  constructor() {
    super();
    this.state = {
      selectedContainer: null,
      selectedContainerExpanded: false,
    };
    this.getServiceContainersList = this.getServiceContainersList.bind(this);
  }

  componentWillMount() {
    this.props.getServiceContainers();
  }

  componentDidUpdate() {
    if (this.props.published && !this.props.processing) {
      return this.props.history.push('/publicNames');
    }
  }

  componentWillUnmount() {
    this.props.reset();
  }

  getServiceContainersList() {
    const { serviceContainers } = this.props;
    if (serviceContainers.length === 0) {
      return (
        <div className="i"><div className="inpt null">No containers found</div></div>
      );
    }
    const selectClassName = classNames('i', {
      open: this.state.selectedContainerExpanded,
    });

    return (
      <div className={selectClassName}>
        <div
          className="inpt"
          onClick={() => {
            this.setState({
              selectedContainerExpanded: !this.state.selectedContainerExpanded,
            });
          }}
        >{this.state.selectedContainer || this.props.serviceContainers[0]}
        </div>
        <ul>
          {
            serviceContainers.map(cont => (
              <li
                key={genKey()}
                onClick={() => {
                  this.handleContainersSelect(cont);
                }}
              >{cont}
              </li>
            ))
          }
        </ul>
      </div>
    );
  }

  handleContainersSelect(cont) {
    this.setState({
      selectedContainer: cont,
      selectedContainerExpanded: false,
    });
  }

  reloadContainers(e) {
    e.preventDefault();
    this.props.getServiceContainers();
  }

  popupOkCb() {
    this.props.reset();
  }

  render() {
    const { publicName, serviceName } = this.props.match.params;
    const { serviceContainers } = this.props;

    return (
      <Base
        reconnect={this.props.reconnect}
        nwState={this.props.nwState}
        processing={this.props.processing}
        error={this.props.error}
        processDesc={this.props.processDesc}
        popupOkCb={this.popupOkCb.bind(this)}
      >
        <div>
          <WizardNav history={this.props.history} />
          <div className="card">
            <div className="card-b">
              <h3 className="h">Choose an Existing Folder</h3>
              <div className="cntr">
                <div className="choose-existing-cntr">
                  <div className="b">
                    <p className="p">This folder content will be added to the SAFE Network and will be publicly viewable using the URL <b>safe://{serviceName}.{publicName}</b>. This folder should contain an index.html file.</p>
                    <div className="select-inpt">
                      {this.getServiceContainersList()}
                      <div className="opt">
                        <button
                          type="button"
                          className="btn"
                          name="reload-containers"
                          disabled={serviceContainers.length === 0}
                          onClick={this.reloadContainers.bind(this)}
                        >{''}
                        </button>
                      </div>
                    </div>
                  </div>
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
                    onClick={(e) => {
                      e.preventDefault();
                      if (!this.state.selectedContainer) {
                        return;
                      }
                      this.props.publish(publicName, serviceName, this.state.selectedContainer);
                    }}
                  >Publish
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

ChooseExistingContainer.propTypes = {
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  processDesc: PropTypes.string.isRequired,
  error: PropTypes.string.isRequired,
  nwState: PropTypes.string.isRequired,
  processing: PropTypes.bool.isRequired,
  published: PropTypes.bool.isRequired,
  serviceContainers: PropTypes.arrayOf(PropTypes.string).isRequired,
  publish: PropTypes.func.isRequired,
  reconnect: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  getServiceContainers: PropTypes.func.isRequired,
};
