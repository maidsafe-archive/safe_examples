// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Base from './_Base';
import { decodeURI, genKey } from '../utils/app';

export default class Remap extends Component {
  constructor() {
    super();
    this.state = {
      selectedContainer: null,
      selectedContainerExpanded: false,
    };
    this.getServiceContainersList = this.getServiceContainersList.bind(this);
  }

  componentDidUpdate() {
    if (this.props.remapped) {
      return this.props.history.push('/publicNames');
    }
  }

  componentWillUnmount() {
    this.props.reset();
  }

  getSelectedContainer() {
    return this.state.selectedContainer || decodeURI(this.props.match.params.containerPath);
  }

  getServiceContainersList() {
    const { serviceContainers } = this.props;
    if (!serviceContainers || serviceContainers.length === 0) {
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
    const { service, publicName, containerPath } = this.props.match.params;
    return (
      <Base
        reconnect={this.props.reconnect}
        nwState={this.props.nwState}
        processing={this.props.processing}
        error={this.props.error}
        processDesc={this.props.processDesc}
        popupOkCb={this.popupOkCb.bind(this)}
      >
        <div className="card">
          <div className="card-b">
            <h3 className="h">Remap service - {service}</h3>
            <div className="cntr">
              <div className="choose-existing-cntr">
                <div className="b">
                  <p className="p">Select the container to be mapped with the service. The contents of the mapped container will be served for safe://{service}.{publicName}</p>
                  <div className="select-inpt">
                    { this.getServiceContainersList() }
                    <div className="opt">
                      <button
                        type="button"
                        className="btn"
                        name="reload-containers"
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
                    this.props.history.push('/publicNames');
                  }}
                >Cancel
                </button>
              </div>
              <div className="opt">
                <button
                  type="button"
                  className="btn flat primary"
                  disabled={this.getSelectedContainer() === decodeURI(containerPath)}
                  onClick={(e) => {
                    e.preventDefault();
                    this.props.remapService(publicName, service, this.getSelectedContainer());
                  }}
                >Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      </Base>
    );
  }
}

Remap.propTypes = {
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  processDesc: PropTypes.string.isRequired,
  error: PropTypes.string.isRequired,
  nwState: PropTypes.string.isRequired,
  processing: PropTypes.bool.isRequired,
  remapped: PropTypes.bool.isRequired,
  serviceContainers: PropTypes.arrayOf(PropTypes.string).isRequired,
  remapService: PropTypes.func.isRequired,
  reconnect: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  getServiceContainers: PropTypes.func.isRequired,
};
