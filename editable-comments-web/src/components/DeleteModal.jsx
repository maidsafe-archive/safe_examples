import React, { Component } from 'react';
import { H3, Button, ModalDialog } from 'nessie';

class DeleteModal extends Component {
  render() {
    const { comment, deleteCb, closeCb } = this.props;
    return (
      <ModalDialog isVisible >
        <div className="_title"> Delete Comment </div>
        <H3> Are you sure you want to delete this comment? </H3>
        <div className="_delBtn">
          <Button
            className="delBtnCancel"
            onClick={() => { closeCb(); }}
          > Cancel
          </Button>
          <Button
            className="delBtnOk"
            onClick={() => { deleteCb(comment); }}
          > Delete
          </Button>
        </div>
      </ModalDialog>
    );
  }
}

export default DeleteModal;
