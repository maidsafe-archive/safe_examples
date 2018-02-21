import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
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
    this.timer = null;
  }

  componentDidMount() {
    this.friendID = this.props.match.params.friendId;
    this.friendUID = this.props.match.params.uid;
    this.props.store.initialiseConnInfo(this.friendID, this.friendUID);
    this.startStream()
      .then(() => this.setupOrigin())
      .then(() => this.setupRemote())
      .then(() => {
        this.originConn.createOffer(this.offerOptions)
          .then(this.onCreateOfferSuccess, (err) => {
            console.error('create offer error :: ', err);
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
        if (store.persona === CONST.USER_POSITION.CALLER && store.remoteOffer) {
          this.call();
        }

        if(store.persona === CONST.USER_POSITION.CALLEE && store.remoteAnswer) {
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
      }).then(() => {
        this.destConn.createAnswer().then((ansDesc) => {
          this.onCreateAnswerSuccess(ansDesc);
        }, (err) => {
          console.error('create answer error :: ', err);
        });
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
    this.destConn.setLocalDescription(answer)
      .then(() => {
        return this.props.store.setAnswer(answer);
        console.log('set destination local session success');
      }, (err) => {
        console.error('set destination local session failed ::', err);
      });
  }

  reset() {
    clearTimeout(this.timer);
    this.props.store.resetConnInfo();
  }

  endCall(e) {
    e.preventDefault();
    this.originConn.close();
    this.destConn.close();
    this.originConn = null;
    this.destConn = null;
    this.reset();
    this.props.history.push('/');
  }

  onClickCancel(e) {
    e.preventDefault();
    const self = this;
    const moveHome = () => {
      console.log('moveHome');
      self.reset();
      self.props.history.push('/');
    };
    this.props.store.deleteInvite()
    .then(moveHome, moveHome);
  }

  getConnectionStatus() {
    let connectionMsg = null;
    const { connectionState } = this.props.store;
    const { CONN_STATE, UI } = CONST;
    const { CONN_MSGS } = UI;

    // FIXME check for not caller persona
    if (connectionState === CONN_STATE.CONNECTED) {
      this.finishConnection();
      return;
    }

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
    return (
      <div className="chat-room-conn-status">
        <div className="chat-room-conn-status-b">
          <h3 className="status">{connectionMsg}</h3>
          <div className="cancel-btn">
            <button
              type="button"
              className="btn primary"
              onClick={this.onClickCancel}
            >Cancel</button>
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
              console.log('set ICE candidate success');
            }, (err) => {
              console.error('set ICE candidate failed ::', err);
            });
        })).then(() => {
          store.connected();
        });
      }, (err) => {
        console.error('set origin remote session failed ::', err);
      });
  }

  render() {
    const { match } = this.props;

    return (
      <div className="chat-room">
        <div className="chat-room-b">
          <div className="chat-room-remote">
            <video ref={(c) => { this.destinaton = c; }} autoPlay></video>
          </div>
          <div className="chat-room-origin">
            <video ref={(c) => { this.origin = c; }} autoPlay></video>
          </div>
        </div>
        {this.getConnectionStatus()}
        <div className="chat-room-opts">
          <button type="button" onClick={this.endCall.bind(this)}>END</button>
        </div>
      </div>
    );
  }
}
