import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observable } from 'mobx';
import { inject, observer } from "mobx-react";
import classNames from 'classnames';
import CONST from '../constants';
@inject("store")
@observer
export default class ChatRoom extends Component {
  @observable originConn = null;
  @observable destConn = null;

  constructor() {
    super();
    this.friendID = null;
    this.friendUID = null;
    this.offerOptions = CONST.CONFIG.OFFER;
    this.mediaOffer = CONST.CONFIG.MEDIA_OFFER;
    this.originStream = null;
    this.originCandidates = [];
    this.destCandidates = [];
    this.onCreateOfferSuccess = this.onCreateOfferSuccess.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
    this.setTimer = this.setTimer.bind(this);
    this.getConnectionStatus = this.getConnectionStatus.bind(this);
    this.timer = null;
  }

  componentWillMount() {
    if (!this.props.store.isAuthorised) {
      return this.props.history.push('/');
    }
    this.friendID = this.props.match.params.friendId;
    this.friendUID = this.props.match.params.uid;
    this.props.store.initialiseConnInfo(this.friendID, this.friendUID)
      .then(() => {
        this.startStream()
          .then(() => this.setupOrigin())
          .then(() => this.setupRemote())
          .then(() => {
            this.originConn.createOffer(this.offerOptions)
              .then(this.onCreateOfferSuccess, (err) => {
                console.error('create offer error :: ', err);
              });
          });
      });
  }

  componentWillUnmount() {
    this.reset();
  }

  setTimer(fn) {
    const { store } = this.props;
    this.timer = setTimeout(() => {
      fn.call(store).then((res) => {
        clearTimeout(this.timer);
        if (!res) {
          this.setTimer(fn);
          return;
        }
        if (store.persona === CONST.USER_POSITION.CALLER && store.remoteOffer && store.state === CONST.CONN_STATE.INVITE_ACCEPTED) {
          this.call();
        }

        if (store.persona === CONST.USER_POSITION.CALLEE && store.remoteAnswer) {
          this.finishConnection();
        }
      });
    }, CONST.UI.TIMER_INTERVAL.CONNECTION_POLL);
  }

  startStream() {
    return window.navigator.mediaDevices.getUserMedia(this.mediaOffer)
      .then((stream) => {
        this.originStream = stream;
        this.origin.srcObject = stream;
      });
  }

  stopAllStreams() {
    if (!this.originStream) {
      return;
    }
    this.originStream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  setupOrigin() {
    return new Promise((resolve) => {
      this.originConn = new window.RTCPeerConnection(CONST.CONFIG.SERVER);
      this.originConn.onicecandidate = (e) => {
        if (!e.candidate) {
          this.props.store.setOfferCandidates(this.originCandidates);
          if (!this.friendID) {
            this.props.store.sendInvite()
              .then(() => {
                this.setTimer(this.props.store.checkInviteAccepted);
              })
          } else {
            this.call();
          }
          return;
        }
        if (!this.originCandidates) {
          this.originCandidates = [];
        }
        this.originCandidates.push(e.candidate);
      };

      this.originConn.addStream(this.originStream);
      resolve();
    });
  }

  setupRemote() {
    return new Promise((resolve) => {
      this.destConn = new window.RTCPeerConnection(CONST.CONFIG.SERVER);

      this.destConn.onicecandidate = (e) => {
        if (!e.candidate) {
          this.props.store.setAnswerCandidates(this.destCandidates);
          if (!this.friendID) {
            this.props.store.calling().then(() => {
              this.setTimer(this.props.store.checkCallAccepted);
            });
          } else {
            this.props.store.acceptInvite().then(() => {
              this.setTimer(this.props.store.checkForCalling);
            });
          }
          return;
        }
        if (!this.destCandidates) {
          this.destCandidates = [];
        }
        this.destCandidates.push(e.candidate);
      };

      this.destConn.onaddstream = (e) => {
        this.destinaton.srcObject = e.stream;
      }
      resolve();
    });
  }

  call() {
    const { store } = this.props;
    this.destConn.setRemoteDescription(store.remoteOffer)
      .then(() => {
        return Promise.all(store.remoteOfferCandidates.map((can) => {
          return this.destConn.addIceCandidate(new RTCIceCandidate(can))
            .then(() => {
              console.log('set ICE candidate success');
            }, (err) => {
              console.error('set ICE candidate failed ::', err);
            });
        }));
      }, (err) => {
        console.error('set destination remote session failed ::', err);
      })
      .then(() => this.destConn.createAnswer())
      .then((ansDesc) => {
        this.onCreateAnswerSuccess(ansDesc);
      }, (err) => {
        console.error('create answer error :: ', err);
      })
      .then(() => {
        if (store.persona === CONST.USER_POSITION.CALLER && store.remoteAnswer) {
          this.finishConnection();
        }
      });
  }

  onCreateOfferSuccess(offer) {
    this.originConn.setLocalDescription(offer)
      .then(() => {
        console.log('set origin local session success');
        return this.props.store.setOffer(offer);
      }, (err) => {
        console.error('set origin local session failed ::', err);
      });
  }

  onCreateAnswerSuccess(answer) {
    const { store } = this.props;
    this.destConn.setLocalDescription(answer)
      .then(() => {
        return store.setAnswer(answer);
        console.log('set destination local session success');
      }, (err) => {
        console.error('set destination local session failed ::', err);
      });
  }

  reset() {
    clearTimeout(this.timer);
    this.props.store.resetConnInfo();
    this.stopAllStreams();
  }

  endCall(e) {
    e.preventDefault();
    this.originConn.close();
    this.destConn.close();
    this.originConn = null;
    this.destConn = null;
    this.reset();
    this.props.history.push('/home');
  }

  onClickCancel(e) {
    e.preventDefault();
    const self = this;
    const moveHome = () => {
      self.reset();
      self.props.history.push('/home');
    };
    this.props.store.deleteInvite()
      .then(moveHome, moveHome);
  }

  getProgress(progress, error) {
    if (error) {
      return (
        <div className="progress error">
          <div className="progress-b">
            <div className="icn"></div>
            <div className="desc">{error}</div>
          </div>
        </div>
      );
    } else if (progress) {
      return (
        <div className="progress">
          <div className="progress-b">
            <div className="icn spinner"></div>
            <div className="desc">{progress}</div>
          </div>
        </div>
      );
    }
    return <span></span>;
  }

  getConnectionStatus() {
    let connectionMsg = null;
    const { store } = this.props;
    const { connectionState } = store;
    const { CONN_STATE, UI } = CONST;
    const { CONN_MSGS } = UI;

    const isConnected = (connectionState === CONN_STATE.CONNECTED);

    if (!isConnected) {
      switch (connectionState) {
        case CONN_STATE.INIT:
          connectionMsg = CONN_MSGS.INIT;
          break;
        case CONN_STATE.SEND_INVITE:
          connectionMsg = CONN_MSGS.SEND_INVITE;
          break;
        case CONN_STATE.INVITE_ACCEPTED:
          connectionMsg = CONN_MSGS.INVITE_ACCEPTED;
          break;
        case CONN_STATE.CALLING:
          connectionMsg = CONN_MSGS.CALLING;
          break;
        default:
          connectionMsg = UI.DEFAULT_LOADING_DESC
      }
    }

    const statusClassName = classNames('status', {
      'connected': connectionState === CONN_STATE.CONNECTED
    });

    return (
      <div className={statusClassName}>
        <div className="status-b">
          <div className="card-1">
            <div className="logo logo-sm">
              <div className="logo-img"></div>
            </div>
            <div className="call-for">
              <div className="call-for-b">
                <div className="caller">{store.activePublicName}</div>
                <div className="split"></div>
                <div className="callee">{this.friendID || store.friendID}</div>
              </div>
              <div className="id">#{this.friendUID || store.uid}</div>
            </div>
            {this.getProgress(connectionMsg, store.chatRoomError)}
            <div className="opts">
              <div className="opt">
                <button className="btn" onClick={this.onClickCancel}>{CONST.UI.LABELS.cancel}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  finishConnection() {
    const { store } = this.props;
    this.originConn.setRemoteDescription(store.remoteAnswer)
      .then(() => {
        Promise.all(store.remoteAnswerCandidates.map((can) => {
          return this.originConn.addIceCandidate(new RTCIceCandidate(can))
            .then(() => {
              console.log('set ICE candidate origin success');
            }, (err) => {
              console.error('set ICE candidate origin failed ::', err);
            });
        })).then(() => {
          if (store.persona === CONST.USER_POSITION.CALLER) {
            return;
          }
          store.connected();
        });
      }, (err) => {
        console.error('set origin remote session failed ::', err);
      });
  }

  render() {
    return (
      <div className="chat-room">
        <div className="remote">
          <video ref={(c) => { this.destinaton = c; }} autoPlay></video>
          <div className="origin">
            <video ref={(c) => { this.origin = c; }} autoPlay></video>
          </div>
          <div className="opts">
            <div className="opt">
              <button className="btn end-call" onClick={this.endCall.bind(this)}></button>
            </div>
          </div>
        </div>
        {this.getConnectionStatus()}
      </div>
    );
  }
}

ChatRoom.propTypes = {
};
