import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import CONSTANTS from '../constants';
import Base from './_base';

export default class Initialisation extends Component {
  constructor() {
    super();
    this.state = {
      showPopup: false,
      popupType: CONSTANTS.UI.POPUP_TYPES.ERROR,
      popupDesc: null,
    };
  }

  componentDidMount() {
    // initialise app
    this.props.initialiseApp();
  }

  componentDidUpdate() {
    // on initialisation done redirect to public names page (Home page)
    if (this.props.fetchedAccessInfo && !this.props.loading) {
      this.props.history.replace('publicNames');
      return;
    }
    // show error popup on initilisation
    if (this.props.error && !this.state.showPopup) {
      this.showErrorPopup(this.props.error);
    }
  }

  showErrorPopup(err) {
    const errMsg = err instanceof Error ? err.message : err;
    this.setState({
      showPopup: true,
      popupDesc: errMsg,
    });
  }

  popupOkCb() {
    // reset initialisation error
    this.props.reset();

    this.setState({
      showPopup: false,
    });

    // move to authorisation page after error popup
    this.props.history.replace('/');
  }

  render() {
    const {
      loading,
      connected,
      fetchedAccessInfo,
    } = this.props;

    const connectedCn = classNames('i', {
      done: connected,
      loading: !connected && loading,
    });

    const accessCntrCn = classNames('i', {
      done: fetchedAccessInfo,
      loading: !fetchedAccessInfo && loading,
    });

    return (
      <Base
        reconnect={this.props.reconnect}
        nwState={this.props.nwState}
        error={this.props.error}
        showPopup={this.state.showPopup}
        popupType={this.state.popupType}
        popupDesc={this.state.popupDesc}
        popupOkCb={this.popupOkCb.bind(this)}
      >
        <div className="card">
          <div className="card-b">
            <h3 className="h type-center">Initialising Application</h3>
            <div className="cntr">
              <div className="init-apps">
                <div className="b">
                  <div className={connectedCn}>Connecting to SAFE Network</div>
                  <div className={accessCntrCn}>Fetching Access Container</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Base>
    );
  }
}

Initialisation.propTypes = {
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  nwState: PropTypes.string.isRequired,
  error: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  connected: PropTypes.bool.isRequired,
  fetchedAccessInfo: PropTypes.bool.isRequired,
  reconnect: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  initialiseApp: PropTypes.func.isRequired,
};
