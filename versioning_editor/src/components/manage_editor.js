import React, { Component } from 'react';
import Editor from 'react-md-editor';
import VersionDiff from './version_diff';
import { EDITOR_THEME, APP_NAME } from '../config';
import '../../node_modules/codemirror/lib/codemirror.css';
import '../../node_modules/react-md-editor/dist/react-md-editor.css';
require(`../../node_modules/codemirror/theme/${EDITOR_THEME}.css`);

import { saveFile, readFile, getSDVersions } from '../store';

export default class ManagedEditor extends Component {

  constructor(props) {
    super();
    this.editorOpts = {
      'theme': EDITOR_THEME
    };

    this.state = {
      code: `# ${APP_NAME}

* A list
* with
* some items

Some **bold** and _italic_ text

> A quote...`,
      versions: []
    };

    this.updateCode = this.updateCode.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.getVersions = this.getVersions.bind(this);
    this.download = this.download.bind(this);
    this.isContentUpdated = this.isContentUpdated.bind(this);
  }

  componentWillMount() {
    if (this.props.isNewFile) {
      return Promise.resolve(true);
    }
    this.props.toggleSpinner(); // set spinner
    return readFile(this.props.filename)
      .then(res => {
        this.setState({ code: JSON.parse(res.toString()).content });
        this.props.toggleSpinner(); // remove spinner
      })
      .then(() => this.getVersions());
  }

  isContentUpdated() {
    return !(this.state.versions.length !== 0 &&
      JSON.parse((this.state.versions.slice(-1)[0]).toString()).content.trim() === this.state.code.trim())
  }

  saveFile() {
    if (!this.state.code.trim()) {
      return Promise.reject('Empty content');
    }
    if (!this.isContentUpdated()) {
      return Promise.reject('No change made');
    }
    this.props.toggleSpinner(); // set spinner
    return saveFile(this.props.filename, this.state.code)
      .then(() => {
        this.props.toggleSpinner(); // remove spinner
        this.props.onSave();
      })
      .then(() => this.getVersions())
  }

  updateCode(newCode) {
    this.setState({
      code: newCode
    });
  }

  getVersions() {
    this.props.toggleSpinner(); // set spinner
    return getSDVersions(this.props.filename)
      .then(res => {
        this.props.toggleSpinner(); // remove spinner
        this.setState({ versions: res })
      });
  }

  download() {
    const content = JSON.parse(this.state.versions.slice(-1)[0]).content;
    const a = document.createElement('a');
    a.download = this.props.filename + '.md';
    a.href = "data:text/markdown;charset=utf8;base64," + new Buffer(content).toString('base64');
    a.click();
  }

  render() {
    return (
      <div className="editor">
        <h3 className="headers-2">Editing <em>{this.props.filename}</em>{this.props.isNewFile ? "*" : ""}</h3>
        <div className="cnt-1">
          <Editor
            value={this.state.code}
            options={this.editorOpts}
            onChange={this.updateCode}/>
          <div className="editor-opts">
            <button className="btn" onClick={this.props.goBack}>Cancel</button>
            <button className="btn pr-btn"
                    disabled={(!this.props.isNewFile && !this.isContentUpdated()) ? 'disabled' : ''}
                    onClick={this.saveFile}>{this.props.isNewFile ? 'Create File' : 'Save new version'}</button>
            {this.props.isNewFile ? '' : <button className="btn pr-btn" onClick={() => this.download()}>Download</button>}
          </div>
        </div>
        <div className="cnt-2">
          <VersionDiff versions={this.state.versions} />
        </div>
      </div>
    )
  }
}