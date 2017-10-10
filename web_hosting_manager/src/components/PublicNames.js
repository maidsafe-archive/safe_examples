// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import CONSTANTS from '../constants';
import Base from './_Base';
import * as utils from '../utils/app';

export default class PublicNames extends Component {
  constructor() {
    super();
    this.state = {
      ...CONSTANTS.UI.POPUP_STATES
    };
  }

  componentDidMount() {
    this.props.fetchServices();
  }

  popupOkCb() {
    // reset authorisation error
    this.props.reset();
    // this.setState(utils.resetPopup());
  }

  getNoPublicNamesContainer() {
    return (
      <div className="no-public-id-cntr">
        <div className="no-public-id-cntr-b">
          <h3>Looks like you dont have a Public ID yet!</h3>
          <h4>Create one now to start publishing websites on the SAFE Network.</h4>
          <span className="new-public-id-arrow">{''}</span>
        </div>
      </div>
    );
  }

  getServiceItem(publicName, service, path, index) {
    return (
      <div className="i-cnt-ls-i" key={index}>
        <div className="i-cnt-ls-i-b">
          <h3 className="name"><a href={`safe://${service}.${publicName}`}>{service}</a></h3>
          <h3 className="location"><Link to={`manageFiles/${publicName}/${service}/${encodeURIComponent(path)}`}>{path}</Link></h3>
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
            >{''}</button>
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
            >{''}</button>
          </div>
        </div>
      </div>
    );
  }

  getPublicNameListItem(publicName, services, index) {
    return (
      <div className="i" key={`publicName-${index}`}>
        <div
          className="i-h"
          onClick={(e) => {
            const classList = e.currentTarget.classList;
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
              >Create Website</button>
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
              Object.keys(services).map((service, i) => {
                return this.getServiceItem(publicName, service, services[service], i);
              })
            }
          </div>
        </div>
      </div>
    );
  }

  getPublicNameList(publicNames) {
    return (
      <div className="public-id-ls">
        <div className="public-id-ls-b">
          {
            Object.keys(publicNames).sort().map((publicName, i) => {
              return this.getPublicNameListItem(publicName, publicNames[publicName], i);
            })
          }
        </div>
      </div>
    );
  }

  render() {
    const { publicNames } = this.props;
    const hasPublicNames = (Object.keys(publicNames).length !== 0);
    const container =  hasPublicNames ? this.getPublicNameList(publicNames) : this.getNoPublicNamesContainer();

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
};
