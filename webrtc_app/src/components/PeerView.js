import React, { Component } from 'react'
import Peer from 'simple-peer'
import { APP_ID } from '../store'


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

    // FIXME: this should move into the store

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
      const data = new Buffer(JSON.stringify({payload: d, targetId: myNewId}))
      safeStructuredData.create(this.props.token, targetId, 500, data)
        .then(parseJsonResponse)
        .then((res) => safeStructuredData.put(this.props.token, res.handleId))
        .then((res) => safeStructuredData.dropHandle(this.props.token, res.handleId))

      if (initiator) {
        let poller = window.setInterval( ()=> {
          safeStructuredData.getHandle(this.props.token, myNewId)
            .then((resp) => {
                console.log(resp)
                if (resp.status !== 200) return
                window.clearInterval(poller);

                let handle = resp.headers.get("Handle-Id")
                console.log('handle', handle)
                return safeStructuredData.readData(this.props.token, handle)
                  .then(parseJsonResponse).then((resp) => {
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
export default PeerView