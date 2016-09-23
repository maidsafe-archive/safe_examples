import React, { Component } from 'react';
// eslint-disable-next-line
import webrtc from 'webrtc-adapter';
import Peer from 'simple-peer';
import logo from './logo.svg';
import './App.css';

// const appInfo = )
//
// auth = fetch("/auth", {method: 'POST', , body: appInfo}).then(console.log.bind(console)).catch(console.warn.bind(this))
//

const APP_ID = "example.signaling.v1"

function apiRequest(method, url, token, body) {
  const headers = { "Content-Type" : "application/json"}
  if (token){
    headers['Authorization'] = "Bearer " + token
  }
  return fetch(url, {method: method, headers: headers, body: body}
    ).then((x) => {
      // for debugging purposes
      console.log("response", x)
      return x
    }).catch(console.error.bind(console))
}

function parseJsonResponse(resp) {
  console.log(resp)
  if (resp.json) return resp.json()
  return resp.body().then((content) => JSON.parse(content))
}

class VideoBlock extends Component {
  constructor() {
    super()
    this.state = {
      myVideo: null,
      state: null,
      error: false,
      stream: null
    }
  }
  componentWillMount() {
    this.setState({"state": "requesting"});
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        facingMode: "user",
        // frameRate: { ideal: 10, max: 15 }
      }
    }).then((stream) => {
      this.setState({
        "state": "received",
        "stream": stream,
        "myVideo": window.URL.createObjectURL(stream)
      });
      this.props.onStream(stream)
    }).catch((err) => {
      this.setState({"error": err})
    })
  }
  render() {
    if (this.state.error){
      return <div>{this.state.error.toString()}</div>
    }

    if (this.state.state === "requesting"){
      return <div><h1>Please give us access to your video devices</h1></div>
    }

    return (<div>
      <video className="me"
        autoPlay={true}
        muted={true}
        src={this.state.myVideo}></video>
    </div>)
  }
}

class PeerView extends Component {
  constructor() {
    super()
    this.state = {
      connectionString: '',
      connectionPayload: '',
      connectionState: 'initializing',
      messages: [],
      peerVideo: null
    }
  }
  sendDraft() {
    let msg = this.refs['draft'].value
    this.peer.send(msg)
    this.addMsg({type: "me", "msg": msg})
    this.refs['draft'].value = ""
    return false
  }

  submitResponse (){
    var val = JSON.parse(window.atob(this.refs['answer'].value));
    this.peer.signal(val)
  }

  addMsg (msg) {
    msg.tstamp = new Date()
    this.state.messages.unshift(msg)
    this.setState({"messages": this.state.messages})
  }

  componentWillReceiveProps(newProps){
    this.setUpPeer(newProps)
  }

  componentWillMount() {
    this.setUpPeer(this.props)
  }

  setUpPeer(props){
    // we've already started setup
    if (this.peer) return;
    this.setState({
      "connectionState": "connecting"
    })

    // we are also not yet in a ready state
    if (!props.stream || !props.token) return

    const initiator = !!!props.peerPayload
    const peer = new Peer({ initiator: initiator,
                          stream: props.stream,
                          trickle: false });
    const targetId = initiator ? APP_ID + "-" + props.room :  props.peerPayload.targetId;
    const myNewId =  APP_ID + "-" + this.props.room + "-" + (Math.random())

    this.peer = peer;
    console.log("mounting", initiator, targetId, props)

    if (!initiator) {
      // let's connect to the other peer
      peer.signal(props.peerPayload.payload)
    }

    peer.on('signal', (d) => {
      // try to automatically establish connection
      const data = {payload: d, targetId: myNewId}
      apiRequest("POST",
          '/structured-data/' + targetId,
          this.props.token, JSON.stringify(data))
      if (initiator) {
        let poller = window.setInterval( ()=> {
          apiRequest("GET",
              '/structured-data/handle/' + myNewId,
              this.props.token).then((resp) => {
                if (resp.status !== 200) return
                window.clearInterval(poller);

                let handle = resp.headers.get("Handle-Id")
                console.log('handle', handle)
                return apiRequest('GET',
                  '/structured-data/' + handle,
                  this.props.token).then(parseJsonResponse).then((resp) => {
                    console.log(resp)
                    peer.signal(resp.payload)
                  })
              })
              // .catch(console.warn.bind(console))
        }, 1000) // we poll once a second
      }
    })
    peer.on('error', (err) => {
      this.addMsg({type: "error", "msg": '' + err})
      console.log('error', err)
    })

    peer.on('connect', () => {
      this.setState({"connectionState": "connected"});
      this.addMsg({type: "system", "msg": 'connection established'})
    })

    peer.on('stream', (stream) => {
      this.addMsg({type: "system", "msg": 'video established'})
      this.setState({"peerVideo": window.URL.createObjectURL(stream)})
    })

    peer.on('data', (data) => {
      // incoming message
      console.log('data: ' + data)
      this.addMsg({type: "peer", "msg": data.toString()})
    })
  }
  render() {
    if (this.state.connectionState === 'connected') {
      return (<div className="peerview">
      <div className="chat">
        <form onSubmit={this.sendDraft.bind(this)}>
          <input type="text" ref="draft"
          /><button  type="submit">send</button>
        </form>
        <ul>
          {this.state.messages.map(
            (m) => <li className={m.type} title={m.tstamp.toISOString()}>{m.msg}</li>)}
        </ul>
      </div>
      <video className="peer" autoPlay={true}
          src={this.state.peerVideo}></video>
      </div>);
    }
    if (this.state.connectionPayload.type === "offer") {
      return <div>
        <h3>Waiting</h3>
        <p>Please tell the other party to go the following link</p>
        <p><a target="noopener" href={"/#" + window.btoa(JSON.stringify(this.state.connectionPayload))}>copy me</a></p>
        <p>
          And copy-paste their response here:
        </p>
        <form onSubmit={this.submitResponse.bind(this)}>
          <textarea ref="answer"></textarea>
          <button type="submit">send</button>
        </form>
      </div>
    } else if (this.state.connectionPayload.type === "answer") {
      return <div>
        <h3>Waiting</h3>
        <p>Please tell the other party to paste this into their field</p>
        <textarea>{window.btoa(JSON.stringify(this.state.connectionPayload))}
        </textarea>
      </div>
    }
    return (<div>{this.state.connectionState}</div>);
  }
}

class Room extends Component {
  constructor() {
    super()
    this.state = {
      'token': null,
      'peerPayload': false,
      'stream': null
    }
  }

  componentWillMount() {
    if (!this.state.token) {
      apiRequest('POST', '/auth', null, JSON.stringify({
          "app": {
            "name": "SAFE Signaling Demo",
            id: APP_ID,
            "version": "0.6",
            "vendor": "MaidSafe Ltd."},
          "permissions" : ["LOW_LEVEL_API"]})
        ).then(parseJsonResponse).then( (auth) => {
          return apiRequest('GET',
              '/structured-data/handle/' + APP_ID + "-" + this.props.room,
                auth.token).then((resp) => {
                  // we are connecting to someone, who knows us
                  if (resp.status !== 200) {
                    return this.setState({"peerPayload": false,
                                          'token': auth.token})
                  }

                  let handleId = resp.headers.get("Handle-Id")
                  console.log("handleId", handleId)
                  // so let's read what they want us to do
                  return apiRequest('GET',
                    '/structured-data/' + handleId + '/',
                    auth.token
                  ).then((resp) => (resp.status === 200)
                    ? parseJsonResponse(resp).then((payload) => {
                        console.log("peerPayload", payload)
                        this.setState({"peerPayload": payload,
                                       'token': auth.token})
                    })
                    // we need to initiate
                    : this.setState({"peerPayload": false,
                                   'token': auth.token})
                  )
                })
      }).catch(console.warn.bind(console))

    }
  }

  render() {
    if (!this.state.token) {
      return <h1>Please authorise the app with SAFE Launcher</h1>
    }
    return (<div>
      <VideoBlock onStream={(s) => this.setState({"stream": s})}/>
      <PeerView
        stream={this.state.stream}
        room={this.props.room}
        token={this.state.token}
        peerPayload={this.state.peerPayload}/>
    </div>)
  }
}

class App extends Component {
  constructor (){
    super()
    this.state = {
      "room": location.hash.length > 1 ? location.hash.slice(1) : null
    }
  }
  selectRoom(pr, e, evt) {
    evt.preventDefault()
    this.setState({"room": this.refs['room'].value})
    return false
  }
  render() {
    if (!Peer.WEBRTC_SUPPORT) {
      return (
        <div className="App">
          <div className="App-header">
            <h2>Browser not support</h2>
          </div>
          <p className="App-intro">
          The browser you are using doesn't have the required <a href="http://caniuse.com/#search=webrtc" target="noopen">WebRTC support</a>. Please try again using latest Chrome or <a href="http://getfirefox.org/">Firefox</a>.
          </p>
        </div>
      );
    }
    if (this.state.room){
      return (
        <div className="App">
          <div className="Room-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h2>SAFE Signaling Demo <a href={"/#" + this.state.room}>#{this.state.room}</a></h2>
          </div>
          <Room room={this.state.room} />
        </div>
      );
    }

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to the SAFE Signaling Demo</h2>
        </div>
        <div className="room-wrap">
          <form className="room-select" onSubmit={this.selectRoom.bind(this)}>
            <label>
              Room: #<input ref='room' required={true} minLength={5} />
            </label>
            <button onClick={this.selectRoom.bind(this)}>
              connect
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default App;
