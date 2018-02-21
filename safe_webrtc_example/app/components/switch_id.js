import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from "mobx-react";
import classNames from 'classnames';

import Loader from './loader';

@inject("store")
@observer
export default class SwitchID extends Component {
  constructor() {
    super();
    this.state = {
      selectedPubName: ''
    };
  }

  componentWillUpdate(nextProps) {
    if(this.state.selectedPubName && this.props.store.loaded) {
      this.props.history.go(-1);
    }
  }

  componentWillUnmount() {
    this.props.store.reset();
  }

  onClickPubName(pubName) {
    if (!pubName) {
      return;
    }
    this.setState({selectedPubName: pubName});
  }

  render() {
    const { store, history } = this.props;

    let container = null;

    if (store.loading) {
      return <Loader desc={store.loaderDesc} />;
    }

    return (
      <div className="base">
        <div className="switch-id">
          <h3 className="title">Choose a Public ID</h3>
          <div className="id-ls">
            {
              store.publicNames.map((pub, i) => {
                const lsClass = classNames('id-ls-i', {
                  checked: pub === (this.state.selectedPubName || store.selectedPubName)
                });
                return (
                  <div
                    key={i}
                    className={lsClass}
                    onClick={() => {
                      this.onClickPubName(pub);
                    }}
                  >{pub}</div>
                );
              })
            }
          </div>
          <div className="refresh-btn">
            <button
              type="button"
              className="btn flat primary"
              onClick={(e) => {
                e.preventDefault();
                store.fetchPublicNames();
              }}
            >Refresh</button>
          </div>
          <div className="ack">
            <p>Do you want to activate this Public ID with the WebRTC service?</p>
            <div className="opts">
              <div className="opt">
                <button
                  type="button"
                  className="btn primary"
                  disabled={!this.state.selectedPubName || this.state.selectedPubName === store.selectedPubName}
                  onClick={(e) => {
                    e.preventDefault();
                    store.activatePubName(this.state.selectedPubName);
                    // history.go(-1);
                  }}
                >Activate</button></div>
              <div className="opt">
                <button
                  type="button"
                  className="btn"
                  onClick={(e) => {
                    history.go(-1);
                  }}
                >Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SwitchID.propTypes = {
};
