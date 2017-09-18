// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CONSTANTS from '../constants';
import Base from './_Base';

export default class Authorisation extends Component {
  componentDidMount() {
    // send auth request on load
    this.props.sendAuthReq();
  }

  componentDidUpdate() {
    // route to initialise page on auth success
    if (this.props.authorised) {
      return this.props.history.push('/initialise');
    }
  }

  popupOkCb() {
    this.props.reset();
  }

  render() {
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
            <h3 className="h type-center">Waiting for Authorisation</h3>
            <div className="cntr">
              <div className="authorise">
                <p>
                  Authorisation request sent. Application needs manage access to <b>_publicNames</b> &amp; <b>_public</b> containers. Approve the request from Authenticator to continue.
                </p>
                <p>
                  The Public ID and Services must be added to the <b>_publicNames</b> container for allowing other applications to collaborate.
                </p>
                <p>
                  Authorisation information will be stored on local keychain. The local data can be manually cleared from the menu option.
                  <br /><i>File > Clear Access Data</i>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Base>
    );
  }
}

Authorisation.propTypes = {
  authorised: PropTypes.bool
};
