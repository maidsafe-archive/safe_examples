import React, { Component } from 'react'
import PeerView from './PeerView'
import VideoBlock from './VideoBlock'
import { authorise, readData } from '../store'

class Room extends Component {
  constructor () {
    super()
    this.state = {
      'authorised': false,
      'peerPayload': null,
      'stream': null
    }
  }

  componentWillMount () {
    authorise().then(
      // use the base64 encoded version of the room
      () => readData(this.props.room)
        .then((payload) => {
          this.setState({'peerPayload': payload, 'authorised': true})
        }).catch((err) => {
          console.log(err)
          this.setState({'peerPayload': false, 'authorised': true})
        })
    ).catch(console.warn.bind(console))
  }

  render () {
    if (!this.state.authorised) {
      return <h1>Please authorise the app with SAFE Launcher</h1>
    }
    return (<div>
      <VideoBlock onStream={(s) => this.setState({'stream': s})} />
      <PeerView
        stream={this.state.stream}
        room={this.props.room}
        authorised={this.state.authorised}
        peerPayload={this.state.peerPayload} />
    </div>)
  }
}

export default Room
