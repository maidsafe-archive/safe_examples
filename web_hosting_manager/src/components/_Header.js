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
        <NavLink to="newPublicName"><button
          className="btn-with-add-icon"
          title={CONSTANTS.UI.TOOLTIPS.ADD_PUBLIC_NAME}
          type="button"
        >New public ID</button></NavLink>
      </div>
    );
  }

  render() {
    const { showOpt, nwState, reconnect } = this.props;

    const newPublicIdBtn = showOpt ? this.getPublicIdBtn() : null;
    const connectCn = classNames('connection-status', {
      reconnect: (nwState === CONSTANTS.NETWORK_STATE.DISCONNECTED),
      connecting: (nwState === CONSTANTS.NETWORK_STATE.INIT)
    });

    return (
      <header>
        <div className="sec-left">
          <div className="brand">
            <span className="brand-i">{''}</span>
            <div className={connectCn}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  reconnect();
                }}
              >{''}</button>
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
