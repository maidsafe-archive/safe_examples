import React, { Component } from 'react'
import Editor from 'react-md-editor'
import './App.css'

import { EDITOR_THEME } from './config.js'
import { authorise } from './store.js'


require("../node_modules/codemirror/lib/codemirror.css")
require('../node_modules/codemirror/theme/'+ EDITOR_THEME + '.css')
require("../node_modules/react-md-editor/dist/react-md-editor.css")


class ManagedEditor extends Component {

  constructor() {
    super()

    this.editorOpts = {
      'theme': EDITOR_THEME
    }

    this.state = {
      code: `# React Markdown Editor

* A list
* with
* some items

Some **bold** and _italic_ text

> A quote...`
    }
    this.updateCode = this.updateCode.bind(this)

  }

  updateCode(newCode) {
    this.setState({
        code: newCode
    })
  }

  render() {
    return (
        <Editor
          value={this.state.code}
          options={this.editorOpts}
          onChange={this.updateCode} />
    )
  }
}

class App extends Component {

  constructor() {
    super()
    this.state = {
      'authorised': false
    }
  }

  componentWillMount() {
    authorise().then(() => {
      this.setState({'authorised': true})
    })
  }

  render() {

    let sub = <div className="info"><p>Please authorise the app in Launcher.</p></div>
    if (this.state.authorised){
      sub = <ManagedEditor />
    }
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to SAFE example Editor</h2>
        </div>
        {sub}
      </div>
    )
  }
}

export default App;
