// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class App extends Component {
  render() {
    return (
      <div style={{ height: '100%' }}>
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.element.isRequired,
};
