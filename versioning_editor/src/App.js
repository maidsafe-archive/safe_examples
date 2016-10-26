import React, { Component } from 'react'
import Editor from 'react-md-editor'
import keys from 'lodash.keys'
import './App.css'

import { EDITOR_THEME } from './config.js'
import { authorise, getFileIndex, saveFile } from './store.js'


require("../node_modules/codemirror/lib/codemirror.css")
require('../node_modules/codemirror/theme/'+ EDITOR_THEME + '.css')
require("../node_modules/react-md-editor/dist/react-md-editor.css")


class ManagedEditor extends Component {

  constructor(props) {
    super()

    this.editorOpts = {
      'theme': EDITOR_THEME
    }

    this.state = {
      loading: true,
      code: `# React Markdown Editor

* A list
* with
* some items

Some **bold** and _italic_ text

> A quote...`
    }

    this.updateCode = this.updateCode.bind(this)
    this.saveFile = this.saveFile.bind(this)

  }

  componentWillMount() {
    if (this.props.isNewFile) {
      this.setState({'loading': false})
    }
  }

  saveFile() {
    this.setState({'loading': true})
    saveFile(this.props.filename, this.state.code).then(() => {
      this.setState({'loading': false})
      this.props.onSave()
    })
  }

  updateCode(newCode) {
    this.setState({
        code: newCode
    })
  }

  render() {
    return (
      <div>
        <h1>Editing <em>{this.props.filename}</em>{this.props.isNewFile ? "*" : ""}</h1>
        <Editor
          value={this.state.code}
          options={this.editorOpts}
          onChange={this.updateCode} />
        <div>
          <button>cancel</button> <button onClick={this.saveFile}>{this.props.isNewFile ? 'Create File' : 'Save new version'}</button>
        </div>
      </div>
    )
  }
}

class FileSelector extends Component {

  newFile() {
    let filename = this.refs.filename.value.trim()
    if (!filename) return
    this.props.onSelectFile(filename)
  }

  render() {
    let files = <p><em>no files yet</em></p>
    if (this.props.files.length) {
      files = <ul>{this.props.files.map((f) => <li onClick={() => this.onSelectFile(f)}>{f}</li>)}</ul>

    }

    return <div className="fileSelector">
      <h1>Select the file you want to edit</h1>
      {files}

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
      'files': {}
    }
  }

  componentWillMount() {
    authorise().then(() => {
      this.setState({'authorised': true})
      return getFileIndex().then(files => {
        console.log("loaded files", files)
        this.setState({'files': files})
      })
    })
  }

  render() {

    let sub = <div className="info"><p>Please authorise the app in Launcher.</p></div>
    if (this.state.authorised) {
      if (this.state.selectedFile) {
        sub = <ManagedEditor
          filename={this.state.selectedFile}
          onSave={ () => {
            getFileIndex().then(files => this.setState({'files': files}))
          }}
          isNewFile={!this.state.files[this.state.selectedFile]} />
      } else {
        sub = <FileSelector files={keys(this.state.files)} onSelectFile={(f) => this.setState({selectedFile: f})} />
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
