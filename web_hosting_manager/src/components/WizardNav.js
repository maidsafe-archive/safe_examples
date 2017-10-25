// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CONSTANTS from '../constants';

export default class WizardNav extends Component {
  render() {
    return (
      <div className="wiz-nav">
        <div className="b">
          <div className="i">
            <button
              type="button"
              className="go-back-btn"
              title={CONSTANTS.UI.TOOLTIPS.BACK}
              onClick={(e) => {
                e.preventDefault();
                this.props.history.go(-1);
              }}
            >{''}
            </button>
          </div>
          <div className="i">
            <button
              type="button"
              className="go-home-btn"
              title={CONSTANTS.UI.TOOLTIPS.HOME}
              onClick={(e) => {
                e.preventDefault();
                this.props.history.push('/publicNames');
              }}
            >{''}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

WizardNav.propTypes = {
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
