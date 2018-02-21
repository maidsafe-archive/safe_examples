import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from "mobx-react";

import WebrtcLogo from '../images/logo.png';

@inject("store")
@observer
export default class App extends Component {
  componentDidMount() {
    this.props.store.authorisation()
      .then(() => this.props.store.fetchPublicNames())
  }

  render() {
    return (
      <div className="root-b">
        <div className="root-h">
          <div className="brand">
            <div className="brand-img"><img src={WebrtcLogo} alt="WebRTC logo" /></div>
            <div className="brand-name">WebRTC Signalling Example App</div>
          </div>
        </div>
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.element.isRequired,
};
