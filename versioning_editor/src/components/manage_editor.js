import React, { Component } from 'react';
import Editor from 'react-md-editor';
import VersionDiff from './version_diff';
import { EDITOR_THEME } from '../config';
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
      loading: true,
      code: `# React Markdown Editor

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
  }

  componentWillMount() {
    if (this.props.isNewFile) {
      this.setState({ 'loading': false })
    } else {
      return readFile(this.props.filename)
        .then(res => {
          this.setState({ code: JSON.parse(res.toString()).content });
        })
        .then(() => this.getVersions());
    }
  }

  saveFile() {
    this.setState({ 'loading': true });
    if (!this.state.code.trim()) {
      return Promise.reject('Empty content');
    }
    if (this.state.versions.length !== 0 &&
      JSON.parse((this.state.versions.slice(-1)[0]).toString()).content === this.state.code.trim()) {
      return Promise.reject('No change made');
    }
    saveFile(this.props.filename, this.state.code)
      .then(() => {
        this.setState({ 'loading': false });
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
    return getSDVersions(this.props.filename)
      .then(res => this.setState({ versions: res }));
  }

  download() {
    const a = document.createElement('a');
    a.download = this.props.filename + '.md';
    a.href = "data:text/markdown;charset=utf8;base64," + new Buffer(this.state.code).toString('base64');
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