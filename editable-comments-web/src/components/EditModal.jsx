import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { H3, TextArea, Button, ModalDialog } from 'nessie';

@observer
class EditModal extends Component {
  @observable updatedMessage = '';

  @action
  handleChange = (e) => {
    e.preventDefault();
    this.updatedMessage = e.target.value;
  }

  render() {
    const { comment, editCb, closeCb } = this.props;
    const lastMsg = comment.messages[comment.version - 1];
    return (
      <div>
        <ModalDialog isVisible >
          <div className="_title"> Edit Comment </div>
          <H3> Commented as {comment.name} </H3>
          <TextArea
            defaultValue={lastMsg}
            onChange={this.handleChange}
          />
          <div className="_editBtn">
            <Button
              className="editBtnCancel"
              onClick={() => { closeCb(); }}
            > Cancel
            </Button>
            <Button
              className="editBtnOk"
              isDisabled={!this.updatedMessage || this.updatedMessage === lastMsg}
              onClick={() => { editCb(comment, this.updatedMessage); }}
            > Save Edit
            </Button>
          </div>
        </ModalDialog>
      </div>
    );
  }
}

export default EditModal;
