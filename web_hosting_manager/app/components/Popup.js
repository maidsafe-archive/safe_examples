// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CONSTANTS from '../constants';
import ErrorEle from './_Error';

export default class Popup extends Component {
  constructor() {
    super();
    this.getLoaderContainer = this.getLoaderContainer.bind(this);
    this.getErrorContainer = this.getErrorContainer.bind(this);
    this.getAuthRequestContainer = this.getAuthRequestContainer.bind(this);
  }
  getLoaderContainer() {
    return (
      <div className="popup-loader">
        <div className="i"></div>
        <h4 className="desc">{this.props.desc}</h4>
      </div>
    )
  }

  getErrorContainer() {
    return (
      <div className="popup-error">
        <div className="icon"></div>
        {ErrorEle(<div className="desc">{this.props.desc}</div>)}
        <div className="opt">
          <button
            type="button"
            className="btn flat primary"
            onClick={(e) => {
              e.preventDefault();
              this.props.okCb();
            }}
          >Ok</button>
        </div>
      </div>
    );
  }

  getAuthRequestContainer() {
    return (
      <div className="auth-popup">
        <h3>Mutable Data Authorisation</h3>
        <p className="desc">{this.props.desc} cannot be modified. Will require authorisation to modify the contents in the container. Send authorisation request now?</p>
        <div className="opts">
          <div className="opt">
            <button
              type="button"
              className="btn flat"
              onClick={(e) => {
                e.preventDefault();
                this.props.cancelCb();
              }}
            >Close</button>
          </div>
          <div className="opt">
            <button
              type="button"
              className="btn flat primary"
              onClick={(e) => {
                e.preventDefault();
                this.props.okCb();
              }}
            >Ok</button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { show, type } = this.props;
    let container = null;
    switch(type) {
      case CONSTANTS.UI.POPUP_TYPES.LOADING:
        container = this.getLoaderContainer();
        break;
      case CONSTANTS.UI.POPUP_TYPES.ERROR:
        container = this.getErrorContainer();
        break;
      case CONSTANTS.UI.POPUP_TYPES.AUTH_REQ:
        container = this.getAuthRequestContainer();
        break;
    }
    if (!show || !container) {
      return <span>{''}</span>
    }
    return (
      <div className="popup">
        <div className="b">
          <div className="cntr">
            {container}
          </div>
        </div>
      </div>
    );
  }
}

Popup.propTypes = {
  show: PropTypes.bool,
  type: PropTypes.string,
  desc: PropTypes.string
};
