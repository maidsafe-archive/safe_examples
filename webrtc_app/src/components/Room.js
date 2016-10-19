import React, { Component } from 'react'
import PeerView from './PeerView'
import { APP_ID } from '../store'

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
      window.safeAuth.authorise({
          "name": "SAFE Signaling Demo",
          id: APP_ID,
          "version": "0.7",
          "vendor": "MaidSafe Ltd.",
          "permissions" : ["LOW_LEVEL_API"]}, APP_ID
        ).then(parseJsonResponse).then( (auth) => {
          return safeStructuredData.getHandle(auth.token, APP_ID + "-" + this.props.room)
                    .then((resp) => {

                  // we are connecting to someone, who knows us
                  let handleId = resp.handleId
                  console.log("handleId", handleId)
                  // so let's read what they want us to do
                  return safeStructuredData(auth.token, handleId)
                      .then((payload) => {
                        console.log("peerPayload", payload)
                        this.setState({"peerPayload": payload,
                                       'token': auth.token})
                    }
                  )
                }).catch(()=>
                  // we need to initiate
                  this.setState({"peerPayload": false,
                                 'token': auth.token})
                  )
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



export default Room