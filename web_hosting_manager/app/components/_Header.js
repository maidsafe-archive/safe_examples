// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

import CONSTANTS from '../constants';

export default class Header extends Component {
  getPublicIdBtn() {
    return (
      <div className="new-public-id">
        <button
          className="btn-with-add-icon"
          type="button"
          ><NavLink to="newPublicName">New public ID</NavLink></button>
      </div>
    );
  }

  render() {
    const { showOpt, nwState } = this.props;

    const newPublicIdBtn = showOpt ? this.getPublicIdBtn() : null;
    const connectCn = classNames('connection-status', {
      reconnect: (nwState === CONSTANTS.NETWORK_STATE.DISCONNECTED)
    });

    return (
      <header>
        <div className="sec-left">
          <div className="brand">
            <span className="brand-i">{''}</span>
            <div className={connectCn}>
              <button type="button">{''}</button>
            </div>
          </div>
        </div>
        <div className="sec-center">
          <div className="title">Home</div>
        </div>
        <div className="sec-right">
          {newPublicIdBtn}
        </div>
      </header>
    );
  }
}

Header.propTypes = {
  showOpt: PropTypes.bool
};

