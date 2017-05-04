import React, { Component } from 'react'
import keys from 'lodash.keys'
import Spinner from './spinner';
import { authorise, getFileIndex } from '../store';
import { APP_NAME } from '../config';

import FileSelector from './file_selector';
import ManagedEditor from './manage_editor';

export default class App extends Component {

  constructor() {
    super();
    this.state = {
      'authorised': false,
      'selectedFile': null,
      'files': {},
      loading: false
    };
    this.toggleSpinner = this.toggleSpinner.bind(this);
  }

  componentDidMount() {
    document.title = APP_NAME;
  }

  componentWillMount() {
    authorise().then(() => {
      this.setState({ 'authorised': true });
      this.toggleSpinner(); // set spinner
      return getFileIndex().then(files => {
        console.log("loaded files", files);
        this.setState({ 'files': files });
        this.toggleSpinner(); // remove spinner
      })
    })
  }

  toggleSpinner() {
    this.setState({ loading: !this.state.loading });
  }

  render() {

    let sub = <div className="info"><p>Please authorise the app in Authenticator.</p></div>;
    if (this.state.authorised) {
      if (this.state.selectedFile) {
        sub = <ManagedEditor
          filename={this.state.selectedFile}
          onSave={ () => {
            getFileIndex().then(files => this.setState({ 'files': files }))
          }}
          isNewFile={!this.state.files[this.state.selectedFile]}
          goBack={() => this.setState({ selectedFile: null })}
          toggleSpinner={this.toggleSpinner}
        />
      } else {
        sub = <FileSelector
          files={keys(this.state.files)}
          onSelectFile={(f) => this.setState({ selectedFile: f })}
        />
      }
    }
    return (
      <div className="App">
        <div className="App-header">
          <h2>{APP_NAME}</h2>
        </div>
        {sub}
        <Spinner show={this.state.loading} />
      </div>
    );
  }
}