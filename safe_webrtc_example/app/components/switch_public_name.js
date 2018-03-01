import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from "mobx-react";
import classNames from 'classnames';

import CONST from '../constants';
import ActivePublicName from './active_public_name';

@inject("store")
@observer
export default class SwitchPublicName extends Component {
  constructor() {
    super();
    this.state = {
      selectedPubName: null
    };
  }
  componentWillMount() {
    if (!this.props.store.isAuthorised) {
      return this.props.history.push('/');
    }
    this.props.store.fetchPublicNames();
  }

  componentWillUnmount() {
    this.props.store.reset();
    this.props.store.resetSwitchIDState();
  }

  onClickPubName(name) {
    if (!name) { return };
    this.props.store.resetSwitchIDState();
    this.setState({ selectedPubName: name });
  }

  getOptions(onlyCancel) {
    const { store, history } = this.props;

    return (
      <div className="opts">
        {
          !onlyCancel ? (
            <div className="opt">
              <button className="btn primary" disabled={!this.state.selectedPubName} onClick={() => {
                store.activatePublicName(this.state.selectedPubName)
                  .then(() => {
                    history.push('/home');
                  });
              }}>{CONST.UI.LABELS.activate}</button>
            </div>
          ) : null
        }
        <div className="opt">
          <button className="btn" onClick={() => {
            history.push('/home');
          }}>{CONST.UI.LABELS.cancel}</button>
        </div>
      </div>
    );
  }

  getProgressLoader(msg) {
    return (
      <div className="progress">
        <div className="progress-b">
          <div className="icn spinner"></div>
          <div className="desc">{msg}</div>
        </div>
      </div>
    )
  }

  getError(msg) {
    return (
      <div>
        <div className="progress error">
          <div className="progress-b">
            <div className="icn"></div>
            <div className="desc">{msg}</div>
          </div>
        </div>
        {this.getOptions(true)}
      </div>
    );
  }

  getProgress() {
    const { store } = this.props;

    if (store.switchIDError) {
      return (
        <div className="progress error">
          <div className="progress-b">
            <div className="icn"></div>
            <div className="desc">{store.switchIDError}</div>
          </div>
        </div>
      );
    }
    if (store.switchIDProgress) {
      return this.getProgressLoader(store.switchIDProgress);
    }

    return <span></span>
  }

  getPubNamesList() {
    const { store, history } = this.props;
    let container = undefined;
    if (store.publicNames.length === 1) {
      container = <div className="default">{CONST.UI.LABELS.noPublicName}</div>
    } else {
      container = (
        <ul>
          {
            store.publicNames.map((pub, i) => {
              if (pub === store.activePublicName) {
                return null;
              }
              const listClassName = classNames({
                active: pub === this.state.selectedPubName
              });
              return (
                <li key={i} className={listClassName} onClick={() => {
                  this.onClickPubName(pub);
                }}>{pub}</li>
              );
            })
          }
        </ul>
      )
    }
    return (
      <div>
        <h3>{CONST.UI.LABELS.choosePublicName}</h3>
        {container}
        {!store.switchIDProgress ? this.getOptions() : null}
      </div>
    );
  }

  getActivePublicContainer() {
    const { store, history } = this.props;
    if (!store.activePublicName) {
      return <span></span>
    }

    return <ActivePublicName history={history} publicName={store.activePublicName} disableOptions />
  }

  render() {
    const { store } = this.props;
    let container = undefined;

    if (store.error) {
      container = this.getError(store.error);
    } else if (store.progress) {
      container = this.getProgressLoader(store.progress);
    } else {
      container = this.getPubNamesList();
    }

    return (
      <div className="card-1 home">
        <div className="logo logo-sm">
          <div className="logo-img"></div>
        </div>
        <div className="list">
          {container}
        </div>
        {this.getProgress()}
        {this.getActivePublicContainer()}
      </div>
    );
  }
}

SwitchPublicName.propTypes = {
};
