import React, { Component } from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

@observer
class Comment extends Component {
  getDeleteLink() {
    const { comment, deleteComment } = this.props;
    return (
      <div className="_opt">
        <button
          className="deleteComment"
          onClick={() => { deleteComment(comment); }}
        >Delete
        </button>
      </div>
    );
  }

  render() {
    const { comment, isOwner } = this.props;
    const deleteLink = isOwner ? this.getDeleteLink() : null;
    return (
      <li className="_comment-ls-i">
        <div className="_title">
          <span className="_user">{comment.name}</span>
          <span className="_date">{new Date(comment.date).toLocaleString()}</span>
        </div>
        <div className="_message">{comment.message}</div>
        <div className="_opts">
          {deleteLink}
        </div>
      </li>
    );
  }
}

Comment.propTypes = {
  comment: PropTypes.shape({
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired,
  isOwner: PropTypes.bool.isRequired,
  deleteComment: PropTypes.func.isRequired,
};

export default Comment;
