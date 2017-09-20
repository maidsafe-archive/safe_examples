// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Base from './_Base';
import WizardNav from './WizardNav';
import CONSTANTS from '../constants';

export default class NewWebSite extends Component {
  constructor() {
    super();
    this.state = {
      selectedOpt: null
    };
  }

  gotoCreateService(selectedOpt) {
    this.props.history.push(`/createService/${selectedOpt}/${this.props.match.params.publicName}`);
  }

  goNext(e) {
    e.preventDefault();
    this.gotoCreateService(this.state.selectedOpt);
  }

  handleDoubleClick(option) {
    if (!option) {
      return;
    }
    this.gotoCreateService(option);
  }

  getOptions() {
    const template = () => {
      const option = CONSTANTS.UI.NEW_WEBSITE_OPTIONS.TEMPLATE;
      const baseCn = classNames('b', {
        active: option === this.state.selectedOpt
      });
      return (
        <div
          className="option"
          onClick={(e) => {
            e.stopPropagation();
            this.setState({
              selectedOpt: option
            });
          }}
          onDoubleClick={(e) => {
            e.preventDefault();
            this.handleDoubleClick(option);
          }}
        >
          <div className={baseCn}>
            <span className="icon use-template"></span>
            <h3 className="title">Use a Template</h3>
            <p className="desc">Create a simple <br/> example site</p>
          </div>
        </div>
      );
    };

    const fromScratch = () => {
      const option = CONSTANTS.UI.NEW_WEBSITE_OPTIONS.FROM_SCRATCH;
      const baseCn = classNames('b', {
        active: option === this.state.selectedOpt
      });
      return (
        <div
          className="option"
          onClick={(e) => {
            e.stopPropagation();
            this.setState({
              selectedOpt: option
            });
          }}
          onDoubleClick={(e) => {
            e.preventDefault();
            this.handleDoubleClick(option);
          }}
        >
          <div className={baseCn}>
            <span className="icon from-scratch"></span>
            <h3 className="title">Start from Scratch</h3>
            <p className="desc">Create a new folder to be mapped and upload web files</p>
          </div>
        </div>
      );
    };

    const chooseExisting = () => {
      const option = CONSTANTS.UI.NEW_WEBSITE_OPTIONS.CHOOSE_EXISTING;
      const baseCn = classNames('b', {
        active: option === this.state.selectedOpt
      });
      return (
        <div
          className="option"
          onClick={(e) => {
            e.stopPropagation();
            this.setState({
              selectedOpt: option
            });
          }}
          onDoubleClick={(e) => {
            e.preventDefault();
            this.handleDoubleClick(option);
          }}
        >
          <div className={baseCn}>
            <span className="icon choose-existing"></span>
            <h3 className="title">Choose Existing</h3>
            <p className="desc">Choose a folder which contains index.html</p>
          </div>
        </div>
      );
    };
    return (
      <div className="options">
        {template()}
        {fromScratch()}
        {chooseExisting()}
      </div>
    )
  }

  render() {
    return (
      <Base
        reconnect={this.props.reconnect}
        nwState={this.props.nwState}
      >
        <div>
          <WizardNav history={this.props.history} />
          <div className="card">
            <div className="card-b">
              <h3 className="h">Add Content</h3>
              <div className="cntr">
                <div className="create-website">
                  <p className="p">This folder content will be added to the SAFE Network and will be publicly viewable using the URL <b>safe://servicename.publicname</b></p>
                  { this.getOptions() }
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
                  >Cancel</button>
                </div>
                <div className="opt">
                  <button
                    type="button"
                    className="btn flat primary"
                    disabled={!this.state.selectedOpt}
                    onClick={this.goNext.bind(this)}
                  >Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Base>
    );
  }
}

NewWebSite.propTypes = {
};
