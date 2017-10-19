import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

import Comment from './Comment';
import constant from '../constants.js';

@observer
class CommentList extends React.Component {
  @observable newMessage = '';
  @observable isLoading

  componentDidMount() {
    this.props.store.authorise(this.props.topic);
    this.setState(
      {
        isLoading: false,
      });
  }

  getNetworkComponent() {
    const { isNwConnected, isNwConnecting, reconnect } = this.props.store;
    if (isNwConnected) {
      return null;
    }

    const diconnected = (
      <div className="_nwState-b">
        <h3>Network Disconnected</h3>
        <div className="_opt">
          <button name="reconnect" onClick={() => {reconnect()}}>Reconnect</button>
        </div>
      </div>
    );

    const connecting = (
      <div className="_nwState-b connecting" >
        <h3>Network Connecting</h3>
      </div>
    );

    return (
      <div className="_nwState">
        { isNwConnecting ? connecting : diconnected }
      </div>
    )
  }

  getAuthorisingContainer() {
    return (
      <div className="_comments_init">Initialising comments for this post. Please wait...</div>
    );
  }

  getNotEnabledContainer() {
    return (
      <div className="_comments_init">Sorry comments not enabled for this post.</div>
    );
  }

  render() {
    const store = this.props.store;
    const userList = store.publicNames;
    if (store.isAuthorising) {
      return this.getAuthorisingContainer();
    }

    if (!store.isEnabled) {
      return this.getNotEnabledContainer();
    }
    const isLoading = store.isLoading ? (<div className="_comments-loading"><div className="loader-1">{''}</div></div>) : null;

    return (
      <div className="_comments">
        <div className="_comment-box">
          <form onSubmit={this.handleFormSubmit}>
            <div className="_comment-users">
              <label htmlFor="commentUser">Comment as</label>
              <select name="commentUser" ref={(c) => { this.name = c; }}>
                {userList.map((userList, i) => <option key={i} value={userList}>{userList}</option>)}
                <option value={constant.ANONYMOUS} >{constant.ANONYMOUS}</option>
              </select>
            </div>
            <textarea
              className="_comment-msg"
              placeholder="Enter your comment. Not more than 250 characters."
              name="message"
              maxLength="250"
              value={this.newMessage}
              required="required"
              onChange={this.handleInputChange}
            />
            <button className="_comment-post-btn" type="submit" disabled={this.newMessage.length === 0}>Comment</button>
          </form>
        </div>
        <div className="_comment-list">
          <div className="_comments-count">{store.comments.length} Comment(s)</div>
          <ul className="_comment-ls">
            {store.comments.map(comment => (
              <Comment comment={comment} isOwner={store.isOwner} deleteComment={store.deleteComment} key={comment.id} />
            ))}
          </ul>
        </div>
        {isLoading}
        {this.getNetworkComponent()}
      </div>
    );
  }

  @action
  handleInputChange = (e) => {
    this.newMessage = e.target.value;
  };

  @action
  handleFormSubmit = (e) => {
    e.preventDefault();

    const store = this.props.store;
    if (this.name.value === '' || this.newMessage === '') {
      window.alert('Please select your ID and enter comment');
      return;
    }
    store.addComment(this.name.value, this.newMessage);
    this.newMessage = '';
  };
}

export default CommentList;
