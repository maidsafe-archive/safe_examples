import React, { Component } from 'react';
// eslint-disable-next-line
import webrtc from 'webrtc-adapter';
import Peer from 'simple-peer';
import logo from './logo.svg';
import Room from './components/Room';
import VideoBlock from './components/VideoBlock';
import { APP_ID } from './store';
import './App.css';


// FIXME: make this only in dev
require('safe-js/dist/polyfill')

// const appInfo = )
//
// auth = fetch("/auth", {method: 'POST', , body: appInfo}).then(console.log.bind(console)).catch(console.warn.bind(this))
//


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
  if (resp.__parsedResponseBody__) return resp.__parsedResponseBody__
  return resp.body().then((content) => JSON.parse(content))
}


class App extends Component {
  constructor (){
    super()
    this.state = {
      "room": location.hash.length > 1 ? location.hash.slice(1) : null
    }
  }
  selectRoom() {
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
          <label>
            Room: #<input ref='room' required={true} minLength={5} />
          </label>
          <button onClick={(x) => this.selectRoom()}>
            connect
          </button>
        </div>
      </div>
    );
  }
}

export default App;
