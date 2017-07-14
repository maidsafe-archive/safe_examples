import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class App extends Component {
  render() {
    return (
      <div className="root-base">
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.element.isRequired
};
