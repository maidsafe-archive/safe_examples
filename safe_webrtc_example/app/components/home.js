import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from "mobx-react";

import CONST from '../constants';
import ActivePublicName from './active_public_name';

@inject("store")
@observer
export default class Home extends Component {
  constructor() {
    super();
    this.timer = null;
  }

  componentWillMount() {
    if (!this.props.store.isAuthorised) {
      return this.props.history.push('/');
    }
  }

  componentDidMount() {
    this.pollInvite();
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    this.timer = null;
    this.props.store.reset();
  }

  pollInvite() {
    const { store } = this.props;
    const self = this;
    const poll = () => {
      clearTimeout(self.timer);
      self.pollInvite();
    };
    this.timer = setTimeout(() => {
      store.fetchInvites(true).then(poll, poll);
    }, CONST.UI.TIMER_INTERVAL.FETCH_INVITES_POLL);
  }

  getActivePublicContainer() {
    const { store, history } = this.props;
    if (!store.activePublicName) {
      return <span></span>
    }

    return <ActivePublicName history={history} publicName={store.activePublicName} />
  }

  render() {
    const { store, history } = this.props;

    return (
      <div className="card-1 home">
        <div className="logo logo-sm">
          <div className="logo-img"></div>
        </div>
        <div className="split-view">
          <div className="split-view-b">
            <div className="split-view-30 split">
              <div className="invite-label">
                <div className="invite-label-b">
                  <div className="icn"></div>
                  <div className="desc">
                    <a href="#" onClick={e => {
                      e.preventDefault();
                      history.push('invites');
                    }}>{`${CONST.UI.LABELS.invites} ${store.invitesCount ? `(${store.invitesCount})` : ''}`}</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="split-view-70">
              <button className="btn start-call" onClick={() => {
                history.push('new-chat');
              }}>{CONST.UI.LABELS.newVideoCall}</button>
            </div>
          </div>
        </div>
        {this.getActivePublicContainer()}
      </div>
    );
  }
}

Home.propTypes = {
};
