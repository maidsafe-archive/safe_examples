import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from "mobx-react";

import SelectedPubID from './selected_pub_id';
import Loader from './loader';
import Err from './error';

@inject("store")
@observer
export default class NewChat extends Component {
  componentWillUpdate() {
    console.log('new chat loaded', this.props.store.loaded);
    // const title = this.title.value;
    if (this.props.store.loaded) {
      this.props.history.push(`chat-room`);
    }
  }

  componentDidMount() {
    this.friendID.focus();
  }

  onNewChatSubmit(e) {
    e.preventDefault();
    console.log('Friend ID', this.friendID.value)
    const friendID = this.friendID.value;
    // const title = this.title.value;
    // if (!friendID || !title) {
    //   return;
    // }
    this.props.store.connect(this.friendID.value);
  }

  render() {
    const { store, history } = this.props;

    if (store.error) {
      return <Err desc={store.error.message} onClickOkay={() => {
        store.reset();
      }} />;
    }

    if (store.loading) {
      return <Loader desc={store.loaderDesc} />;
    }

    return (
      <div className="base">
        <SelectedPubID showBackBtn pubId={store.selectedPubName} history={history} />
        <div className="card">
          <div className="card-b new-chat">
            <h3 className="title">Enter the PublicID you want to chat with</h3>
            <div className="new-chat-form">
              <form onSubmit={this.onNewChatSubmit.bind(this)}>
                <div className="inpt">
                  <input
                    type="text"
                    placeholder="FriendID"
                    required="required"
                    ref={(c) => {this.friendID = c;}} />
                </div>
                {/* <div className="inpt">
                  <input
                    type="text"
                    placeholder="Title"
                    required="required"
                    ref={(c) => {this.title = c;}} />
                </div> */}
                <div className="inpt-btn">
                  <button type="submit" className="btn primary">Connect</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

NewChat.propTypes = {
};
