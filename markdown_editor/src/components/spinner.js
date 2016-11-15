import React, { Component } from 'react';

export default class Spinner extends Component {

  render() {
    return (
      this.props.show ? (
        <div className="spinner">
          <div className="spinner-cnt"><span className="spinner-i"></span></div>
        </div>
      ) : <span></span>
    );
  }
}
