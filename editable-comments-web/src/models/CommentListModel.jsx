import { observable, action } from 'mobx';

import CommentModel from './CommentModel';
import SafeApi from '../safe_api';
import CONSTANTS from '../constants';

export default class CommentListModel {
  @observable isPostingCmt = false;
  @observable isLoading = false;
  @observable editVisible = false;
  @observable comments = [];
  @observable publicNames = [];
  @observable isAuthorising = false;
  @observable isEnabled = false;
  @observable isOwner = false;
  @observable isNwConnected = true;
  @observable isNwConnecting = false;

  @action
  nwStateCb = (newState) => {
    console.log('@model Network state changed to: ', newState);
    if (newState === CONSTANTS.NET_STATE.CONNECTED) {
      this.isNwConnected = true;
      return;
    }
    this.isNwConnected = false;
  }

  @action
  authorise = async (topic) => {
    try {
      this.isAuthorising = true;
      this.api = new SafeApi(topic, this.nwStateCb);
      await this.api.authorise(topic);
      const comments = await this.api.listComments();
      this.comments = comments;
      this.publicNames = await this.api.getPublicNames();
      this.isOwner = await this.api.isOwner();
      this.isAuthorising = false;
      this.isEnabled = true;
    } catch (err) {
      if (err.message && err.message === CONSTANTS.ERROR_MSG.PUBLIC_ID_DOES_NOT_MATCH) {
        this.isAuthorising = false;
        this.isEnabled = false;
        return;
      }
      console.log(`Failed to initialise: ${err}`);
    }
  }

  @action
  addComment = async (name, message) => {
    try {
      this.isPostingCmt = true;
      const newCmt = new CommentModel(name);
      newCmt.addMessage(message);
      this.comments = await this.api.postComment(newCmt);
      this.isPostingCmt = false;
    } catch (err) {
      console.error(err);
      this.isPostingCmt = false;
    }
  }

  @action
  editComment = async (comment, newMsg) => {
    try {
      comment.addMessage(newMsg);
      this.isLoading = true;
      this.comments = await this.api.postComment(comment);
      this.isLoading = false;
    } catch (err) {
      this.isLoading = false;
      console.error(err);
    }
  }

  @action
  deleteComment = async (id) => {
    try {
      this.isLoading = true;
      this.comments = await this.api.deleteComment(id);
      this.isLoading = false;
    } catch (err) {
      this.isLoading = false;
      console.error(err);
    }
  }

  @action
  reconnect = async () => {
    try {
      this.isNwConnecting = true;
      await this.api.reconnect();
      this.isNwConnecting = false;
      this.isNwConnected = true;
    } catch (err) {
      console.error('reconnect error :: ', err);
      this.isNwConnected = false;
    }
  }
}
