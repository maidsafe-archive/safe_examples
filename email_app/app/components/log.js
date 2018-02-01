import React, { Component } from 'react';

export default class Log extends Component {
  render() {
    return (
      <div className="_logs">{this.state.log}</div> 
    );
  }
}
