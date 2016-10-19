import React, { Component } from 'react'

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

export default VideoBlock