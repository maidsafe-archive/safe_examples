import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Loader extends Component {
  render() {
    return (
      <div className="base">
        <div className="card">
          <div className="card-b loading">
            <div className="icn"><div className="loader"></div></div>
            <h4 className="desc">{this.props.desc}</h4>
          </div>
        </div>
      </div>
    );
  }
}

Loader.propTypes = {
};
