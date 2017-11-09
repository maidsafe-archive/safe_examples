import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Icon } from 'nessie';


@observer
class Comment extends Component {
  render() {
    const { comment, showEditModal, showHistoryModal, showDeleteModal, isOwner } = this.props;

    const editButton = comment.isEditable ? (<button className="_edit" onClick={() => { showEditModal(comment); }}> Edit </button>) : null;

    const historyButton = (comment.version > 1) ? (<button className="_history" onClick={() => { showHistoryModal(comment); }}> {comment.version - 1}</button>) : null;
    return (
      <div>
        <li className="_comment-item">
          <div className="_user">
            {comment.name}
          </div>
          <div className="_message">
            {comment.messages[comment.version - 1]}
          </div>
          <div className="_delete">
            {isOwner ? (
              <span>
                <button className="_del" onClick={() => { showDeleteModal(comment); }}> Delete </button>
              </span>
            ) : null}
            {historyButton}
            {editButton}
          </div>
        </li>
      </div>
    );
  }
}

Comment.propTypes = {
  comment: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default Comment;
