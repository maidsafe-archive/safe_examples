import React, { Component } from 'react'
import keys from 'lodash.keys'
import { authorise, getFileIndex } from '../store';

import FileSelector from './file_selector';
import ManagedEditor from './manage_editor';

export default class App extends Component {

  constructor() {
    super();
    this.state = {
      'authorised': false,
      'selectedFile': null,
      'files': {}
    }
  }

  componentDidMount() {
    document.title = 'SAFE Editor Example';
  }

  componentWillMount() {
    authorise().then(() => {
      this.setState({ 'authorised': true });
      return getFileIndex().then(files => {
        console.log("loaded files", files);
        this.setState({ 'files': files });
      })
    })
  }

  render() {

    let sub = <div className="info"><p>Please authorise the app in Launcher.</p></div>;
    if (this.state.authorised) {
      if (this.state.selectedFile) {
        sub = <ManagedEditor
          filename={this.state.selectedFile}
          onSave={ () => {
            getFileIndex().then(files => this.setState({ 'files': files }))
          }}
          isNewFile={!this.state.files[this.state.selectedFile]}
          goBack={() => this.setState({ selectedFile: null })}/>
      } else {
        sub = <FileSelector files={keys(this.state.files)} onSelectFile={(f) => this.setState({ selectedFile: f })}/>
      }
    }
    return (
      <div className="App">
        <div className="App-header">
          <h2>SAFE Editor Example</h2>
        </div>
        {sub}
      </div>
    );
  }
}