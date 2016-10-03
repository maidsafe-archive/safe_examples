import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import * as base64 from 'urlsafe-base64';
import dateformat from 'dateformat';
import { showError, showSuccess, hashEmailId } from '../utils/app_utils';
import { CONSTANTS } from '../constants';

export default class MailList extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor() {
    super();
    this.appendableHandlerId = null;
    this.listColors = {};
    this.activeIndex = null;
    this.activeType = null;
    this.goBack = this.goBack.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.fetchStructuredData = this.fetchStructuredData.bind(this);
    this.getAppendableDataIdHandle = this.getAppendableDataIdHandle.bind(this);
    this.fetchAppendableDataHandle = this.fetchAppendableDataHandle.bind(this);
    this.removeFromAppendableData = this.removeFromAppendableData.bind(this);
    this.dropAppendableDatahandler = this.dropAppendableDatahandler.bind(this);
    this.clearDeletedData = this.clearDeletedData.bind(this);
  }

  goBack() {
    const { router } = this.context;

    switch (this.activeType) {
      case CONSTANTS.HOME_TABS.INBOX: {
        return this.props.inbox.refresh();
      }
      case CONSTANTS.HOME_TABS.SAVED: {
        router.push('/home');
        return router.push('/saved');
      }
    }
  }

  fetchStructuredData() {
    const { token, rootSDHandle, fetchStructuredData } = this.props;

    if (this.activeType === CONSTANTS.HOME_TABS.INBOX) {
      return this.goBack();
    }

    fetchStructuredData(token, rootSDHandle)
      .then(res => {
        if (res.error) {
          return showError('Get Structure Data Error', res.error.message);
        }
        return this.goBack();
      });
  }

  dropAppendableDatahandler() {
    const { token, dropAppendableDataHandle } = this.props;
    dropAppendableDataHandle(token, this.appendableHandlerId)
      .then(res => {
        if (res.error) {
          return showError('Drop Appendable data error', res.error.message);
        }
        return this.fetchStructuredData();
      });
  }

  clearDeletedData() {
    const { token, clearDeletedData, postAppendableData } = this.props;
    const post = () => {
      postAppendableData(token, this.appendableHandlerId)
        .then(res => {
          if (res.error) {
            return showError('Post Appendabel Data Error', res.error.message);
          }
          return this.dropAppendableDatahandler();
        });
    };

    clearDeletedData(token, this.appendableHandlerId)
      .then(res => {
        if (res.error) {
          return showError('Clear Appendabel Delete Data Error', res.error.message);
        }
        return post();
      });
  }

  removeFromAppendableData() {
    const { token, removeFromAppendableData, postAppendableData } = this.props;

    const post = () => {
      postAppendableData(token, this.appendableHandlerId)
        .then(res => {
          if (res.error) {
            return showError('Post Appendabel Data Error', res.error.message);
          }
          return this.clearDeletedData();
        });
    };

    removeFromAppendableData(token, this.appendableHandlerId, this.activeIndex)
      .then(res => {
        if (res.error) {
          return showError('Remove From Appendabel Data Error', res.error.message);
        }
        return post();
      });
  }

  fetchAppendableDataHandle(dataIdHandle) {
    const { token, fetchAppendableDataHandle, dropHandler } = this.props;

    const dropDataIdHandle = () => {
      dropHandler(token, dataIdHandle)
        .then(res => {
          if (res.error) {
            return console.error('Drop Appendable Data Id Handler error :: ', res.error.message);
          }
          console.warn(res.payload.data);
        });
    };

    fetchAppendableDataHandle(token, dataIdHandle)
      .then(res => {
        if (res.error) {
          return showError('Get Appendable Data Handle Error', res.error.message);
        }
        this.appendableHandlerId = res.payload.data.handleId;
        dropDataIdHandle(dataIdHandle);
        return this.removeFromAppendableData();
      });
  }

  getAppendableDataIdHandle() {
    const { token, coreData, getAppendableDataIdHandle } = this.props;
    const appendableDataName = base64.encode(hashEmailId(coreData.id));
    getAppendableDataIdHandle(token, appendableDataName)
      .then(res => {
        if (res.error) {
          return showError('Get Appendable Data Id Handle Error', res.error.message);
        }
        return this.fetchAppendableDataHandle(res.payload.data.handleId);
      });
  }

  handleDelete(e) {
    e.preventDefault();
    const confirmDelete = (res) => {
      if (res === 1) {
        return;
      }
      const { token, coreData, rootSDHandle, updateStructuredData, postStructuredData, getCipherOptsHandle, deleteCipherOptsHandle } = this.props;

      this.activeIndex = parseInt(e.target.dataset.index);

      if (this.activeType === CONSTANTS.HOME_TABS.INBOX) {
        return this.getAppendableDataIdHandle();
      }

      let saved = [];
      saved = coreData.saved.filter((mail, i) => {
        if (i !== this.activeIndex) {
          return mail;
        }
      });

      coreData.saved = saved;

      const post = (cipherHandleId) => {
        postStructuredData(token, rootSDHandle)
          .then(res => {
            if (res.error) {
              return showError('Post Structure Data Error', res.error.message);
            }
            showSuccess('Deleted Mail', 'Mail Deleted Successfully');
            deleteCipherOptsHandle(token, cipherHandleId);
            return this.fetchStructuredData();
          });
      };

      const update = (cipherHandleId) => {
        updateStructuredData(token, rootSDHandle, coreData, cipherHandleId)
          .then(res => {
            if (res.error) {
              return showError('Deleting Mail Error', res.error.message);
            }
            return post(cipherHandleId);
          });
      };

      getCipherOptsHandle(token, CONSTANTS.ENCRYPTION.SYMMETRIC)
        .then(res => {
          if (res.error) {
            return showError('Get Cipher Handle Error', res.error.message);
          }
          return update(res.payload.data.handleId);
        });
    };

    // remote.dialog.showMessageBox({
    //   type: 'warning',
    //   title: 'Do you want to Delete?',
    //   message: '',
    //   buttons: [ 'Ok', "Cancel" ]
    // }, confirmDelete);
    confirmDelete(0);
  }

  handleSave(e) {
    e.preventDefault();
    this.activeIndex = parseInt(e.target.dataset.index);
    const { token, coreData, rootSDHandle, updateStructuredData, postStructuredData } = this.props;

    coreData.saved.unshift(coreData.inbox[this.activeIndex]);
    delete coreData.inbox[this.activeIndex];

    const post = () => {
      postStructuredData(token, rootSDHandle)
        .then(res => {
          if (res.error) {
            return showError('Saving Mail Error', res.error.message);
          }
          return this.getAppendableDataIdHandle();
        });
    };

    updateStructuredData(token, rootSDHandle, coreData)
      .then(res => {
        if (res.error) {
          return showError('Update Mail Error', res.error.message);
        }
        return post();
      });
  }

  render() {
    const self = this;
    const { processing, coreData, error, inbox, outbox, saved } = this.props;
    let container = null;

    if (processing) {
      container = <li className="mdl-card">Loading...</li>
    } else if (Object.keys(error).length > 0) {
      container = <li className="error">Error in fetching mails!</li>
    } else {
      if (inbox) {
        this.activeType = CONSTANTS.HOME_TABS.INBOX;
        container = (
          <div>
            {
              coreData.inbox.length === 0 ? <li className="mdl-card" title="No data in appendable data">Inbox empty</li> : coreData.inbox.map((mail, i) => {
                if (!self.listColors.hasOwnProperty(mail.from)) {
                  self.listColors[mail.from] = `bg-color-${Object.keys(self.listColors).length % 10}`
                }
                return (
                  <li className="mdl-card" key={i}>
                    <div className="icon">
                      <span className={self.listColors[mail.from]}>{mail.from[0]}</span>
                    </div>
                    <div className="cntx">
                      <h3 className="from">{mail.from}</h3>
                      <h4 className="date">{dateformat(new Date(mail.time), CONSTANTS.DATE_FORMAT)}</h4>
                      <p className="subject">{mail.subject}</p>
                      <p className="context">{mail.body}</p>
                    </div>
                    <div className="opt">
                      <div className="opt-i">
                        <button className="mdl-button mdl-js-button mdl-button--icon" name="add" onClick={this.handleSave}><i className="material-icons" data-index={i}>save</i></button>
                      </div>
                      <div className="opt-i">
                        <button className="mdl-button mdl-js-button mdl-button--icon" name="delete" onClick={this.handleDelete}><i className="material-icons" data-index={i}>delete</i></button>
                      </div>
                    </div>
                  </li>
                )
              })
            }
          </div>
        );
      }
      if (saved) {
        this.activeType = CONSTANTS.HOME_TABS.SAVED;
        container = (
          <div>
            {
              coreData.saved.length === 0 ? <li className="mdl-card">Saved empty</li> : coreData.saved.map((mail, i) => {
                if (!mail) {
                  return;
                }
                if (!self.listColors.hasOwnProperty(mail.from)) {
                  self.listColors[mail.from] = `bg-color-${Object.keys(self.listColors).length % 10}`
                }
                 return (
                  <li className="mdl-card" key={i}>
                    <div className="icon">
                      <span className={this.listColors[mail.from]}>{mail.from[0]}</span>
                    </div>
                    <div className="cntx">
                      <h3 className="from">{mail.from}</h3>
                      <h4 className="date">{dateformat(new Date(mail.time), CONSTANTS.DATE_FORMAT)}</h4>
                      <p className="subject">{mail.subject}</p>
                      <p className="context">{mail.body}</p>
                    </div>
                    <div className="opt">
                      <div className="opt-i">
                        <button className="mdl-button mdl-js-button mdl-button--icon" name="delete" onClick={this.handleDelete}><i className="material-icons" data-index={i}>delete</i></button>
                      </div>
                    </div>
                  </li>
                )
              })
            }
          </div>
        );
      }
    }
    return (
      <ul className="mail-list-item mdl-list">
        {container}
      </ul>
    );
  }
}
