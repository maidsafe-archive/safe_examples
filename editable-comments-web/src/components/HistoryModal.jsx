import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { Button, ModalDialog, MessageBox } from 'nessie';

import Diff from 'react-stylable-diff';

@observer
class HistoryModal extends Component {
  @observable currentIndex = 0;

  constructor() {
    super();
    this.goPrevious = this.goPrevious.bind(this);
    this.goNext = this.goNext.bind(this);
    this.canGoPrev = this.canGoPrev.bind(this);
    this.canGoNext = this.canGoNext.bind(this);
    this.comments = [];
  }

  componentDidMount() {
    const { messages } = this.props;
    this.comments = messages;
    this.currentIndex = this.comments.length - 1;
  }

  canGoPrev() {
    return !(this.currentIndex <= 1);
  }

  canGoNext() {
    return !(this.currentIndex >= this.comments.length - 1);
  }

  @action
  goPrevious(e) {
    e.preventDefault();
    if (!this.canGoPrev()) {
      return false;
    }
    this.currentIndex = this.currentIndex - 1;
  }

  @action
  goNext(e) {
    e.preventDefault();
    if (!this.canGoNext()) {
      return false;
    }
    this.currentIndex = this.currentIndex + 1;
  }

  render() {
    return (
      <div>
        <ModalDialog isVisible >
          <div className="_title"> Comment History </div>
          <MessageBox className="diff">
            <Diff
              className="Difference"
              inputA={this.comments[this.currentIndex - 1]}
              inputB={this.comments[this.currentIndex]}
              type="words"
            />
          </MessageBox>
          <div className="pagination">
            <Button className="prev" isDisabled={!this.canGoPrev()} onClick={this.goPrevious}>❮❮</Button>
            <Button className="next" isDisabled={!this.canGoNext()} onClick={this.goNext}>❯❯</Button>
          </div>
          <Button className="_histBtn" onClick={() => { this.props.closeCb(); }} > Close </Button>
        </ModalDialog>
      </div>
    );
  }
}

export default HistoryModal;
