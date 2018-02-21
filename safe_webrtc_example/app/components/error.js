import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ErrorComp extends Component {
  render() {
    return (
      <div className="card margin-top">
        <div className="card-b error danger">
          <div className="icn"></div>
          <h4 className="desc">{this.props.desc}</h4>
          <div className="opt">
            <button
              type="button"
              className="btn primary"
              onClick={(e) => {
                e.preventDefault();
                this.props.onClickOkay();
              }}
            >Okay</button>
          </div>
        </div>
      </div>
    );
  }
}

ErrorComp.propTypes = {
};
