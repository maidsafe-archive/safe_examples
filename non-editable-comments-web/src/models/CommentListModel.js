import { observable, action } from 'mobx';
import SafeApi from '../safe_api';
import CONSTANTS from '../constants';

import CommentModel from './CommentModel';

export default class CommentListModel {
  @observable comments = [];

  @observable isLoading = false;

  @observable publicNames = [];

  @observable isAuthorising = false;

  @observable isEnabled = false;

  @observable isOwner = false;

  @observable isNwConnected = true;

  @observable isNwConnecting = false;

  sortComments(comments) {
    comments.sort((a, b) => {
      const date1 = new Date(a.date);
      const date2 = new Date(b.date);
      if (date1 > date2) return -1;
      if (date1 < date2) return 1;
      return 0;
    });
    return comments;
  }

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
      this.comments = this.sortComments(comments);
      const publicIDList = await this.api.getPublicNames();
      this.publicNames = publicIDList;
      this.isOwner = await this.api.isOwner();
      this.isAuthorising = false;
      this.isEnabled = true;
    } catch (err) {
      if (err.message && err.message === CONSTANTS.ERROR_MSG.PUBLIC_ID_DOES_NOT_MATCH) {
        this.isAuthorising = false;
        this.isEnabled = false;
        return;
      }
      alert(`Failed to initialise: ${err}`);
    }
  }

  @action
  addComment = async (name, message) => {
    try {
      this.isLoading = true;
      const date = new Date().toUTCString();
      const comments = await this.api.postComment(new CommentModel(name, message, date));
      this.comments = this.sortComments(comments);
      this.isLoading = false;
    } catch (err) {
      console.error('addComment: ', err);
      this.isLoading = false;
    }
  }

  @action
  deleteComment = async (comment) => {
    try {
      this.isLoading = true;
      const comments = await this.api.deleteComment(comment);
      this.comments = this.sortComments(comments);
      this.isLoading = false;
    } catch (err) {
      console.error('deleteComment: ', err);
      this.isLoading = false;
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
