// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Base from './_Base';
import ErrorComp from './_Error';
import * as utils from '../utils/app';

export default class NewPublicName extends Component {
  constructor() {
    super();
    this.state = {
      error: null
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

  createPublicId(e) {
    e.preventDefault();
    const newPublicId = this.newPublicId.value.trim();

    if (!utils.domainCheck(newPublicId)) {
      return this.setState({ error: 'Public name must contain only lowercase alphanumeric characters or - and should contain a min of 3 characters and a max of 62 characters' });
    }

    this.props.createPublicName(newPublicId);
  }

  popupOkCb() {
    this.props.reset();
  }

  componentWillUnmount() {
    this.props.reset();
  }

  render() {
    return (
      <Base
        processing={this.props.processing}
        error={this.props.error}
        processDesc={this.props.processDesc}
        popupOkCb={this.popupOkCb.bind(this)}
      >
        <div className="card">
          <div className="card-b">
            <h3 className="h type-center">
              The ID you create will be your SAFE Network Public ID.<br/>The Public ID will allow others to access the services/websites hosted.
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
                      ref={(c) => {this.newPublicId = c;}}
                    />
                  </div>
                  {
                    this.state.error ?  ErrorComp(<span className="err-msg">{this.state.error}</span>) : null
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
                    this.props.history.goBack();
                  }}
                >Cancel</button>
              </div>
              <div className="opt">
                <button
                  type="button"
                  className="btn flat primary"
                  onClick={this.createPublicId.bind(this)}
                >Create Public Id</button>
              </div>
            </div>
          </div>
        </div>
      </Base>
    );
  }
}

NewPublicName.propTypes = {

};
