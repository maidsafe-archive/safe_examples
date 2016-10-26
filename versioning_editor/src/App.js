import React, { Component } from 'react'
import Editor from 'react-md-editor'
import './App.css'

import { EDITOR_THEME } from './config.js'
import { authorise, refreshFileIndex } from './store.js'


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
      <div>
        <h1>Editing <em>{this.props.filename}</em></h1>
        <Editor
          value={this.state.code}
          options={this.editorOpts}
          onChange={this.updateCode} />
      </div>
    )
  }
}

class FileSelector extends Component {

  newFile() {
    console.log(this.refs.filename)
    let filename = this.refs.filename.value.trim()
    if (!filename) return
    this.props.onSelectFile(filename)
  }

  render() {
    return <div>
      <h1>Select the file you want to edit</h1>
      <ul>
        <li></li>
      </ul>

      <div><input ref="filename" placeholder="new filename here" /> <button onClick={this.newFile.bind(this)}>+ new File</button></div>
    </div>
  }

}

class App extends Component {

  constructor() {
    super()
    this.state = {
      'authorised': false,
      'selectedFile': null,
      'files': null
    }
  }

  componentWillMount() {
    authorise().then(() => {
      this.setState({'authorised': true})
      return refreshFileIndex().then(files => {
        this.setState({'files': files})
      })
    })
  }

  render() {

    let sub = <div className="info"><p>Please authorise the app in Launcher.</p></div>
    if (this.state.authorised) {
      if (this.state.selectedFile) {
        sub = <ManagedEditor filename={this.state.selectedFile} />
      } else {
        sub = <FileSelector onSelectFile={(f) => this.setState({selectedFile: f})} />
      }
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
