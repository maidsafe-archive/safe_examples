import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { H3, Form, TextArea, Button, Spinner } from 'nessie';

import Comment from './Comment';
import EditModal from './EditModal';
import HistoryModal from './HistoryModal';
import DeleteModal from './DeleteModal';
import CONSTANTS from '../constants';

@observer
class CommentList extends Component {
  @observable newMessage = '';
  @observable isLoading;
  @observable editModal = {
    show: false,
    comment: {},
  };
  @observable historyModal = {
    show: false,
    id: '',
    messages: [],
  };
  @observable deleteModal = {
    show: false,
    comment: {},
  };

  constructor() {
    super();
    this.showEditModal = this.showEditModal.bind(this);
    this.showHistoryModal = this.showHistoryModal.bind(this);
    this.showDeleteModal = this.showDeleteModal.bind(this);
    this.editCb = this.editCb.bind(this);
    this.deleteCb = this.deleteCb.bind(this);
    this.closeEditCb = this.closeEditCb.bind(this);
    this.closeHistoryCb = this.closeHistoryCb.bind(this);
    this.closeDeleteCb = this.closeDeleteCb.bind(this);
    this.getNetworkComponent = this.getNetworkComponent.bind(this);
  }

  componentDidMount() {
    this.props.store.authorise(this.props.topic);
    this.setState({ isLoading: false });
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
          <button name="reconnect" onClick={() => { reconnect(); }}>Reconnect</button>
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
        {isNwConnecting ? connecting : diconnected}
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

  @action
  handleInputChange = (e) => {
    this.newMessage = e.target.value;
  };

  @action
  handleSubmit = (e) => {
    e.preventDefault();
    const { store } = this.props;
    if (this.name.value === '' || this.newMessage.trim() === '') {
      alert('Please select name and enter message');
      return;
    }
    store.addComment(this.name.value, this.newMessage);
    this.newMessage = '';
  }

  showEditModal(comment) {
    const { store } = this.props;
    this.editModal = {
      show: true,
      comment,
    };
  }

  showHistoryModal(comment) {
    this.historyModal = {
      show: true,
      id: comment.id,
      messages: comment.messages,
    };

  }

  showDeleteModal(comment) {
    this.deleteModal = {
      show: true,
      comment,
    };
  }

  editCb(comment, newMsg) {
    this.props.store.editComment(comment, newMsg);
    this.editModal = {
      show: false,
      comment: {},
    };
  }

  deleteCb(id) {
    this.props.store.deleteComment(id);
    this.deleteModal = {
      show: false,
      id: '',
    };
  }

  closeEditCb() {
    this.editModal.show = false;
  }

  closeHistoryCb() {
    this.historyModal.show = false;
  }

  closeDeleteCb() {
    this.deleteModal.show = false;
  }

  render() {
    const { store } = this.props;
    const userList = store.publicNames;

    if (store.isAuthorising) {
      return this.getAuthorisingContainer();
    }

    if (!store.isEnabled) {
      return this.getNotEnabledContainer();
    }

    const isLoading = store.isLoading ? (
      <div className="_comment_overlay">
        <Spinner size="big" />
        <div className="_comment_overlay_msg">{CONSTANTS.DEFAULT_LOADING_MSG}</div>
      </div>
    ) : null;

    return (
      <div>
        <div className="_comments">
          <div className="_comment-box">
            <H3>Leave your comments</H3>
            <Form submitLabel="Proceed" discardLabel="Cancel" className="_comment_form">
              <select name="commentUser" ref={(c) => { this.name = c; }}>
                {userList.map((userList, i) => <option key={i} value={userList}>{userList}</option>)}
                <option value={CONSTANTS.ANONYMOUS} >{CONSTANTS.ANONYMOUS}</option>
              </select>
              <TextArea
                placeholder="Your Comments!"
                value={this.newMessage}
                onChange={this.handleInputChange}
              />
              <Button
                onClick={this.handleSubmit}
                isLoading={store.isPostingCmt}
                isDisabled={!store.isPostingCmt && !this.newMessage}
              > Post </Button>
              {
                store.isPostingCmt ? (
                  <div className="_comment_fadeout">
                    <span className="_process_msg">Posting...</span>
                  </div>
                ) : null
              }
            </Form>
          </div>
          <div className="count">{store.comments.length} Comment(s)</div>
          <ul className="comment-ls">
            {store.comments.map(comment => (
              <Comment
                comment={comment}
                key={comment.id}
                isOwner={store.isOwner}
                deleteComment={store.deleteComment}
                showEditModal={this.showEditModal}
                showHistoryModal={this.showHistoryModal}
                showDeleteModal={this.showDeleteModal}
              />))}
          </ul>
          {
            this.editModal.show ? (
              <EditModal
                key={`${this.editModal.comment.id || ''}-edit`}
                comment={this.editModal.comment}
                editCb={this.editCb}
                closeCb={this.closeEditCb}
                isVisible={this.editModal.show}
              />
            ) : null
          }
          {
            this.deleteModal.show ? (
              <DeleteModal
                key={`${this.deleteModal.comment.id}-deleteAlert`}
                comment={this.deleteModal.comment}
                deleteCb={this.deleteCb}
                closeCb={this.closeDeleteCb}
              />
            ) : null
          }
          {
            this.historyModal.show ? (
              <HistoryModal
                key={`${this.historyModal.id}-history`}
                messages={this.historyModal.messages}
                closeCb={this.closeHistoryCb}
                isVisible={this.historyModal.show}
              />
            ) : null
          }
        </div>
        {this.getNetworkComponent()}
        {isLoading}
      </div>
    );
  }
}

export default CommentList;
