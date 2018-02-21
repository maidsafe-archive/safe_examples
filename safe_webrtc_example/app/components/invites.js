import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from "mobx-react";

import SelectedPubID from './selected_pub_id';
import Loader from './loader';

@inject("store")
@observer
export default class Invites extends Component {
  componentWillMount() {
    this.props.store.resetFetchCount();
    this.props.store.fetchInvites();
  }

  onClickInvite(invite) {
    console.log('invite selected', invite);
    this.props.history.push(`chat-room/${invite.publicId}/${invite.uid}`);
  }

  render() {
    const { store, history } = this.props;

    if (store.loading) {
      return <Loader desc={store.loaderDesc} />;
    }

    return (
      <div className="base">
        <SelectedPubID showBackBtn pubId={store.selectedPubName} history={history} />
        <div className="invites">
          <h3 className="title">You have {store.invites.length} invite(s)</h3>
          <div className="invites-ls">
            {
              store.invites.map((invite, i) => {
                return (
                  <div
                    key={i}
                    className="invites-ls-i"
                    onClick={(e) => {
                      this.onClickInvite(invite);
                    }}
                  >{invite.publicId} {invite.uid}</div>
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
                store.fetchInvites();
              }}
            >Refresh</button>
          </div>
        </div>
      </div>
    );
  }
}

Invites.propTypes = {
};
