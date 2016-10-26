import React, { Component } from 'react';
import Editor from 'react-md-editor';
import './App.css';

// CONFIGURATION

// Theme for the editor
// try 'elegant' or 'material'
// see all: https://codemirror.net/demo/theme.html
const EDITOR_THEME = 'mdn-like'; 


require("../node_modules/codemirror/lib/codemirror.css")
require('../node_modules/codemirror/theme/'+ EDITOR_THEME + '.css')
require("../node_modules/react-md-editor/dist/react-md-editor.css")


class App extends Component {

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
      <div className="App">
        <div className="App-header">
          <h2>Welcome to SAFE example Editor</h2>
        </div>
        <Editor
          value={this.state.code}
          options={this.editorOpts}
          onChange={this.updateCode} />
      </div>
    );
  }
}

export default App;
