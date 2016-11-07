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
      return;
    }
    if(JSON.parse((this.state.versions.slice(-1)[0]).toString()).content === this.state.code.trim()) {
      return;
    }
    saveFile(this.props.filename, this.state.code).then(() => {
      this.setState({ 'loading': false });
      this.props.onSave();
    })
  }

  updateCode(newCode) {
    this.setState({
      code: newCode
    });
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
      <div className="editor">
        <h3 className="headers-2">Editing <em>{this.props.filename}</em>{this.props.isNewFile ? "*" : ""}</h3>
        <div className="cnt-1">
          <Editor
            value={this.state.code}
            options={this.editorOpts}
            onChange={this.updateCode}/>
          <div className="editor-opts">
            <button className="btn" onClick={this.props.goBack}>Cancel</button>
            <button className="btn pr-btn" onClick={this.saveFile}>{this.props.isNewFile ? 'Create File' : 'Save new version'}</button>
            <button className="btn pr-btn" onClick={() => downloadFile(this.props.filename)}>Download</button>
          </div>
        </div>
        <div className="cnt-2">
          <div className="version-diff">
            <div className="diff-h">
              <div className="diff-h-sec">
                <div className="dif-nav">
                  <button onClick={() => this.setDiff('A', (() => {
                    if (this.state.compA <= 0) return 0;
                    return --this.state.compA;
                  })())}>&lt;</button>
                  <button onClick={() => this.setDiff('A', (() => {
                    if (this.state.compA === (this.state.versions.length - 1)) return this.state.compA;
                    return ++this.state.compA;
                  })())}>&gt;</button>
                </div>
                <select name="diffA"
                        value={this.state.compA}
                        onChange={e => this.setDiff('A', event.target.value)}>
                  <option value="-1">Select A</option>
                  {
                    this.state.versions.map((version, i) => {
                      return <option value={i}>version {i}</option>
                    })
                  }
                </select>
              </div>
              <div className="diff-h-sec">
                <select name="diffB"
                        value={this.state.compB}
                        onChange={e => this.setDiff('B', event.target.value)}>
                  <option value="-1">Select B</option>
                  {
                    this.state.versions.map((version, i) => {
                      return <option value={i}>version {i}</option>;
                    })
                  }
                </select>
                <div className="dif-nav">
                  <button onClick={() => this.setDiff('B', (() => {
                    if (this.state.compB <= 0) return 0;
                    return --this.state.compB;
                  })())}>&lt;</button>
                  <button onClick={() => this.setDiff('B', (() => {
                    if (this.state.compB === (this.state.versions.length - 1)) return this.state.compB;
                    return ++this.state.compB;
                  })())}>&gt;</button>
                </div>
              </div>
              <div className="diff-h-sec">
                <button className="btn pr-btn" onClick={() => this.getVersions()}>Refresh</button>
              </div>
            </div>
          </div>
          <div className="version-diff-cnt">
            {
              (this.state.compA !== -1 && this.state.compB !== -1) ? <Diff
                inputA={JSON.parse(this.state.versions[this.state.compA].toString()).content}
                inputB={JSON.parse(this.state.versions[this.state.compB].toString()).content}
                type="chars"/> : ''
            }
          </div>
        </div>
      </div>
    )
  }
}