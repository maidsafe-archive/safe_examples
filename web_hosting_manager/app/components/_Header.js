// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

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
    const { showOpt } = this.props;

    const newPublicIdBtn = showOpt ? this.getPublicIdBtn() : null;

    return (
      <header>
        <div className="sec-left">
          <div className="brand">
            <span className="brand-i"></span>
            <div className="connection-status reconnect">
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

