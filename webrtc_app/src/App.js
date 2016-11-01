/* global location */

import React, { Component } from 'react'
// eslint-disable-next-line
import webrtc from 'webrtc-adapter'
import Peer from 'simple-peer'
import logo from './logo.svg'
import Room from './components/Room'
import { generate } from 'easypass'
import './App.css'

function roomNameGenerator() {
  const seperators = ['-', '.', '@', '_', 'x', '+', '*']
  return generate([3,4,5,6,7][Math.floor(Math.random()* 5)]) + seperators[Math.floor(Math.random()* seperators.length)] + generate([3,4,5,6,7][Math.floor(Math.random()* 5)])

}

class App extends Component {
  constructor () {
    super()
    this.state = {
      'room': location.hash.length > 1 ? location.hash.slice(1) : null,
      'randomRoom': roomNameGenerator()
    }
  }
  selectRoom () {
    const roomVal = this.refs['room'].value.trim() || this.state.randomRoom
    if (roomVal.length < 5) return

    this.setState({'room': roomVal})
    document.location.hash = roomVal
    return false
  }
  render () {
    if (!Peer.WEBRTC_SUPPORT) {
      return (
        <div className='App'>
          <div className='App-header'>
            <h2>Browser not support</h2>
          </div>
          <p className='App-intro'>
            The browser you are using doesn't have the required <a href='http://caniuse.com/#search=webrtc' target='noopen'>WebRTC support</a>. Please try again using latest Chrome or <a href='http://getfirefox.org/'>Firefox</a>.
          </p>
        </div>
      )
    }
    if (this.state.room) {
      return (
        <div className='App'>
          <div className='Room-header'>
            <img src={logo} className='App-logo' alt='logo' />
            <h2>SAFE Signalling Demo <a href={'/#' + this.state.room}>#{this.state.room}</a></h2>
          </div>
          <Room room={this.state.room} />
        </div>
      )
    }

    return (
      <div className='App'>
        <div className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          <h2>Welcome to the SAFE Signalling Demo</h2>
        </div>
        <div className='room-wrap'>
          <label>
            Room: #<input placeholder={this.state.randomRoom} ref='room' onKeyDown={(e) => e.nativeEvent.keyIdentifier === 'Enter' ? this.selectRoom() : ''} required minLength={5} />
          </label>
          <button onClick={(x) => this.selectRoom()}>
            connect
          </button>
        </div>
      </div>
    )
  }
}

export default App
