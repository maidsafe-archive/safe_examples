import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from "mobx-react";
import classNames from 'classnames';
import CONST from '../constants';
import ActivePublicName from './active_public_name';

@inject("store")
@observer
export default class Invites extends Component {
  constructor() {
    super();
    this.state = {
      selectedInvite: {
        publicId: null,
        uid: null
      }
    };
  }

  componentWillMount() {
    if (!this.props.store.isAuthorised) {
      return this.props.history.push('/');
    }
    this.props.store.fetchInvites();
  }

  componentWillUnmount() {
    this.props.store.reset();
  }

  onClickInvite(invite) {
    if (!invite.publicId || !invite.uid) { return };

    this.setState({ selectedInvite: invite });
  }

  getOptions(onlyCancel) {
    const { store, history } = this.props;
    return (
      <div className="opts">
        {
          !onlyCancel ? (
            <div className="opt">
              <button
                className="btn primary"
                disabled={!this.state.selectedInvite.publicId || !this.state.selectedInvite.uid || (store.invites.length === 0)}
                onClick={() => {
                  history.push(`chat-room/${this.state.selectedInvite.publicId}/${this.state.selectedInvite.uid}`);
                }}>{CONST.UI.LABELS.connect}</button>
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

  // getProgress() {
  //   const { store } = this.props;

  //   if (store.error) {
  //     return (
  //       <div className="progress error">
  //         <div className="progress-b">
  //           <div className="icn"></div>
  //           <div className="desc">{store.error}</div>
  //         </div>
  //       </div>
  //     );
  //   }
  //   return this.getProgressLoader(store.progress);
  // }

  getInvitesList() {
    const { store, history } = this.props;
    let container = undefined;
    if (store.invites.length === 0) {
      container = <div className="default">{CONST.UI.LABELS.noInvites}</div>
    } else {
      container = (
        <ul>
          {
            store.invites.map((invite, i) => {
              const listClassName = classNames({
                active: (invite.uid === this.state.selectedInvite.uid) && (invite.publicId === this.state.selectedInvite.publicId)
              });
              return (
                <li key={i} className={listClassName} onClick={() => {
                  this.onClickInvite(invite);
                }}>{invite.publicId} {invite.uid}</li>
              );
            })
          }
        </ul>
      );
    }
    return (
      <div>
        <h3>{CONST.UI.LABELS.chooseInvite}</h3>
        {container}
        {this.getOptions()}
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
      container = this.getInvitesList();
    }

    return (
      <div className="card-1 home">
        <div className="logo logo-sm">
          <div className="logo-img"></div>
        </div>
        <div className="list">
          {container}
        </div>
        {this.getActivePublicContainer()}
      </div>
    );
  }
}

Invites.propTypes = {
};
