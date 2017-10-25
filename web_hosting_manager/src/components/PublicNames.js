// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import CONSTANTS from '../constants';
import Base from './_Base';
import { genKey } from '../utils/app';

export default class PublicNames extends Component {
  constructor() {
    super();
    this.noPublicNameCntr = {
      title: 'Looks like you dont have a Public ID yet!',
      desc: 'Create one now to start publishing websites on the SAFE Network.',
    };
    this.state = {
      ...CONSTANTS.UI.POPUP_STATES,
    };
  }

  componentDidMount() {
    this.props.fetchServices();
  }

  getNoPublicNamesContainer() {
    return (
      <div className="no-public-id-cntr">
        <div className="no-public-id-cntr-b">
          <h3>{this.noPublicNameCntr.title}</h3>
          <h4>{this.noPublicNameCntr.desc}</h4>
          <span className="new-public-id-arrow">{''}</span>
        </div>
      </div>
    );
  }

  getServiceItem(publicName, service, path) {
    return (
      <div className="i-cnt-ls-i" key={genKey()}>
        <div className="i-cnt-ls-i-b">
          <h3 className="name"><a href={`safe://${service}.${publicName}`}>{service}</a></h3>
          <h3 className="location">
            <Link to={`manageFiles/${publicName}/${service}/${encodeURIComponent(path)}`}>{path}</Link>
          </h3>
        </div>
        <div className="opt">
          <div className="opt-i">
            <button
              type="button"
              className="delete-btn"
              title={CONSTANTS.UI.TOOLTIPS.DELETE_SERVICE}
              onClick={(e) => {
                e.preventDefault();
                this.props.deleteService(publicName, service);
              }}
            >{''}
            </button>
          </div>
          <div className="opt-i">
            <button
              type="button"
              title={CONSTANTS.UI.TOOLTIPS.REMAP_SERVICE}
              className="remap-btn"
              onClick={(e) => {
                e.preventDefault();
                this.props.history.push(`/remap/${publicName}/${service}/${encodeURIComponent(path)}`);
              }}
            >{''}
            </button>
          </div>
        </div>
      </div>
    );
  }

  getPublicNameListItem(publicName, services = []) {
    return (
      <div className="i" key={`publicName-${genKey()}`}>
        <div
          className="i-h"
          onClick={(e) => {
            const { classList } = e.currentTarget;
            if (classList.contains('expand')) {
              classList.remove('expand');
              return;
            }
            classList.add('expand');
          }}
        >
          <div className="i-name" title="Public ID 1">{publicName}</div>
          <div className="i-new-btn">
            <button
              className="btn-with-add-icon"
              type="button"
              title={CONSTANTS.UI.TOOLTIPS.ADD_WEBSITE}
              onClick={(e) => {
                e.stopPropagation();
                this.props.history.push(`/newWebSite/${publicName}`);
              }}
            >Create Website
            </button>
          </div>
        </div>
        <div className="i-cnt">
          <div className="i-cnt-h">
            <div className="i-cnt-h-b">
              <span className="name">Website</span>
              <span className="location">Location</span>
            </div>
          </div>
          <div className="i-cnt-ls">
            {
              services.map(service =>
                this.getServiceItem(publicName, service.name, service.path))
            }
          </div>
        </div>
      </div>
    );
  }

  getPublicNameList(publicNames) {
    console.log('publicNames', publicNames)
    const sortPubName = (a, b) => (a.name > b.name);

    return (
      <div className="public-id-ls">
        <div className="public-id-ls-b">
          {
            publicNames.sort(sortPubName).map(publicName =>
              this.getPublicNameListItem(publicName.name, publicName.services))
          }
        </div>
      </div>
    );
  }

  popupOkCb() {
    // reset authorisation error
    this.props.reset();
  }

  render() {
    const { publicNames } = this.props;
    const hasPublicNames = (publicNames.length !== 0);
    const container = hasPublicNames ?
      this.getPublicNameList(publicNames) : this.getNoPublicNamesContainer();

    return (
      <Base
        reconnect={this.props.reconnect}
        nwState={this.props.nwState}
        scrollableContainer={!hasPublicNames}
        showHeaderOpts
        processing={this.props.processing}
        error={this.props.error}
        processDesc={this.props.processDesc}
        popupOkCb={this.popupOkCb.bind(this)}
      >
        {container}
      </Base>
    );
  }
}

PublicNames.propTypes = {
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  publicNames: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  processDesc: PropTypes.string.isRequired,
  error: PropTypes.string.isRequired,
  nwState: PropTypes.string.isRequired,
  processing: PropTypes.bool.isRequired,
  reconnect: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  deleteService: PropTypes.func.isRequired,
  fetchServices: PropTypes.func.isRequired,
};
