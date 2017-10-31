import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Base from './_base';
import ErrorComp from './_error';
import * as utils from '../utils/app';
import CONSTANTS from '../constants';

export default class NewPublicName extends Component {
  constructor() {
    super();
    this.state = {
      error: '',
    };
  }

  componentDidMount() {
    if (this.newPublicId) {
      this.newPublicId.focus();
    }
  }

  componentDidUpdate() {
    if (this.props.createdPublicName && !this.props.processing) {
      return this.props.history.replace('publicNames');
    }
  }

  componentWillUnmount() {
    this.props.reset();
  }

  createPublicId(e) {
    e.preventDefault();
    const newPublicId = this.newPublicId.value.trim();

    if (!utils.domainCheck(newPublicId)) {
      return this.setState({ error: CONSTANTS.UI.ERROR_MSG.INVALID_PUBLIC_NAME });
    }

    this.props.createPublicName(newPublicId);
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
            <h3 className="h type-center">
              The ID you create will be your SAFE Network Public ID.<br />
              The Public ID will allow others to access the services/websites hosted.
            </h3>
            <div className="cntr">
              <div className="new-public-id">
                <div className="b">
                  <div className="inpt">
                    <input
                      type="text"
                      name="new-public-id"
                      placeholder="Enter Public ID"
                      onKeyPress={(e) => {
                        if (e.charCode === 13) {
                          this.createPublicId(e);
                        }
                      }}
                      ref={(c) => { this.newPublicId = c; }}
                    />
                  </div>
                  {
                    this.state.error ?
                      ErrorComp(<span className="err-msg">{this.state.error}</span>) : null
                  }
                </div>
              </div>
            </div>
            <div className="opts">
              <div className="opt">
                <button
                  className="btn flat"
                  onClick={(e) => {
                    e.preventDefault();
                    this.props.history.go(-1);
                  }}
                >Cancel
                </button>
              </div>
              <div className="opt">
                <button
                  type="button"
                  className="btn flat primary"
                  onClick={this.createPublicId.bind(this)}
                >Create Public Id
                </button>
              </div>
            </div>
          </div>
        </div>
      </Base>
    );
  }
}

NewPublicName.propTypes = {
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  createdPublicName: PropTypes.bool.isRequired,
  processing: PropTypes.bool.isRequired,
  processDesc: PropTypes.string.isRequired,
  error: PropTypes.string.isRequired,
  nwState: PropTypes.string.isRequired,
  reconnect: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  createPublicName: PropTypes.func.isRequired,
};
