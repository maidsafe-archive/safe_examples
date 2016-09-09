import React, { Component } from 'react';
import Peer from 'simple-peer';
import logo from './logo.svg';
import './App.css';

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
      <PeerView stream={this.state.stream} />
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

  componentWillMount() {
    this.setState({
      "connectionState": "connecting"
    })

    var peer = new Peer({ initiator: location.hash.length <= 1,
                          stream: this.props.stream,
                          trickle: false });
    var conData = location.hash.slice(1);

    this.peer = peer;
    console.log("mounting")

    // we are the second peer
    if (conData){
      var parse = JSON.parse(window.atob(conData))
      console.log("sending", parse)
      peer.signal(parse)
    }

    peer.on('signal',  (data) => {
      // automatically establish connection
      console.log("SIGNAL", data)
      this.setState({'connectionPayload': data });
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

class App extends Component {
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
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to SAFE Signaling Demo</h2>
        </div>
        <VideoBlock />
      </div>
    );
  }
}

export default App;
