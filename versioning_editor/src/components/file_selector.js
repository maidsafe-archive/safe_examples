import React, { Component } from 'react';

export default class FileSelector extends Component {

  newFile() {
    let filename = this.refs.filename.value.trim();
    if (!filename) return;
    this.props.onSelectFile(filename);
  }

  render() {
    let files = <p><em>no files yet</em></p>;
    if (this.props.files.length) {
      files = <ul>{this.props.files.map((f) => <li onClick={() => this.onSelectFile(f)}>{f}</li>)}</ul>;

    }

    return (
      <div className="fileSelector">
        <h1>Select the file you want to edit</h1>
        {files}

        <div><input ref="filename" placeholder="new filename here"/>
          <button onClick={this.newFile.bind(this)}>+ new File</button>
        </div>
      </div>
    );
  }
}
