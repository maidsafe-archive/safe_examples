import React, { Component } from 'react';
import Editor from 'react-md-editor';
import Diff from 'react-diff';
import { EDITOR_THEME } from '../config';
import '../../node_modules/codemirror/lib/codemirror.css';
import '../../node_modules/react-md-editor/dist/react-md-editor.css';
require(`../../node_modules/codemirror/theme/${EDITOR_THEME}.css`);

import { saveFile, readFile, downloadFile, getSDVersions } from '../store';

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
      versions: [],
      compA: -1,
      compB: -1
    };

    this.updateCode = this.updateCode.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.getVersions = this.getVersions.bind(this);
    this.setDiff = this.setDiff.bind(this);
  }

  componentWillMount() {
    if (this.props.isNewFile) {
      this.setState({ 'loading': false })
    } else {
      readFile(this.props.filename)
        .then(res => {
          this.setState({ code: JSON.parse(res.toString()).content });
        });
    }
  }

  saveFile() {
    this.setState({ 'loading': true })
    saveFile(this.props.filename, this.state.code).then(() => {
      this.setState({ 'loading': false })
      this.props.onSave()
    })
  }

  updateCode(newCode) {
    this.setState({
      code: newCode
    })
  }

  getVersions() {
    getSDVersions(this.props.filename)
      .then(res => this.setState({ versions: res }));
  }

  setDiff(select, version) {
    if (select === 'A') {
      return this.setState({ compA: parseInt(version, 10) });
    }
    if (select === 'B') {
      return this.setState({ compB: parseInt(version, 10) });
    }
  }

  render() {
    return (
      <div>
        <h1>Editing <em>{this.props.filename}</em>{this.props.isNewFile ? "*" : ""}</h1>
        <Editor
          value={this.state.code}
          options={this.editorOpts}
          onChange={this.updateCode}/>
        <div>
          <button onClick={this.props.goBack}>cancel</button>
          <button onClick={this.saveFile}>{this.props.isNewFile ? 'Create File' : 'Save new version'}</button>
          <button onClick={() => downloadFile(this.props.filename)}>download</button>
          <button onClick={this.getVersions}>SD Version</button>
        </div>
        <div>
          <select name="diffA" onChange={e => this.setDiff('A', event.target.value)}>
            <option value="-1">Select A</option>
            {
              this.state.versions.map((version, i) => {
                return <option value={i}>version {i}</option>
              })
            }
          </select>
          <select name="diffB" onChange={e => this.setDiff('B', event.target.value)}>
            <option value="-1">Select B</option>
            {
              this.state.versions.map((version, i) => {
                return <option value={i}>version {i}</option>
              })
            }
          </select>
        </div>
        <div>
          {
            (this.state.compA !== -1 && this.state.compB !== -1) ? <Diff
              inputA={JSON.parse(this.state.versions[this.state.compA].toString()).content}
              inputB={JSON.parse(this.state.versions[this.state.compB].toString()).content}
              type="chars"/> : ''
          }
        </div>
      </div>
    )
  }
}