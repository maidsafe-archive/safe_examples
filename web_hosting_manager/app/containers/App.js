// @flow
import React, { Component } from 'react';
import type { Children } from 'react';

export default class App extends Component {
  props: {
    children: Children
  };

  render() {
    return (
      <div style={{height: "100%"}}>
        {this.props.children}
      </div>
    );
  }
}
