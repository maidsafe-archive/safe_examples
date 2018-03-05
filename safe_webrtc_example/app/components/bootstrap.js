import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from "mobx-react";

import CONST from '../constants';

@inject("store")
@observer
export default class Bootstrap extends Component {
  componentDidMount() {
    const { store, history } = this.props;

    store.authorisation()
      .then(() => store.fetchPublicNames())
      .then(() => store.setupPublicName())
      .then(() => {
        history.push('home');
      })
  }

  getError(err) {
    if(!err) {
      return <span></span>;
    }

    return (
      <div className="context-b error">
        <div className="icn"></div>
        <div className="desc">{err}</div>
      </div>
    );
  }

  getProgress(desc) {
    if (!desc) {
      return <span></span>;
    }

    return (
      <div className="context-b">
        <div className="icn spinner"></div>
        <div className="desc">{desc}</div>
      </div>
    );
  }

  render() {
    const { store } = this.props;

    let container = undefined;

    if (store.error) {
      container = this.getError(store.error);
    } else {
      container = this.getProgress(store.progress);
    }

    return (
      <div className="card-1 bootstrap">
        <div className="logo">
          <div className="logo-img"></div>
          <div className="logo-desc">{CONST.UI.LABELS.title}</div>
        </div>
        <div className="context">
          {container}
        </div>
      </div>
    );
  }
}

Bootstrap.propTypes = {

};
