// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Header from './_Header';
import Popup from './Popup';
import CONSTANTS from '../constants';

export default class Base extends Component {
  render() {
    const { showAuthReq, error, processing, processDesc } = this.props;

    const rootContainerCn = classNames('root-container-b', {
      'no-scroll': this.props.scrollableContainer
    });

    const showPopup = showAuthReq || error || processing;
    const popupDesc = error ? error : processDesc;
    const popupType = showAuthReq ? CONSTANTS.UI.POPUP_TYPES.AUTH_REQ :
      (error ? CONSTANTS.UI.POPUP_TYPES.ERROR : CONSTANTS.UI.POPUP_TYPES.LOADING);
    return (
      <div className="root-b">
        <Header showOpt={this.props.showHeaderOpts}/>
        <div className="root-container">
          <div className={rootContainerCn}>
            {this.props.children}
            <Popup
              show={showPopup}
              type={popupType}
              desc={popupDesc}
              okCb={this.props.popupOkCb}
              cancelCb={this.props.popupCancelCb}
            />
          </div>
        </div>
      </div>
    );
  }
}

Base.propTypes = {
  children: PropTypes.element.isRequired,
  scrollableContainer: PropTypes.bool,
  showHeaderOpts: PropTypes.bool,
  showAuthReq: PropTypes.bool,
  processing: PropTypes.bool,
  error: PropTypes.string,
  processDesc: PropTypes.string,
  popupCancelCb: PropTypes.func
};
