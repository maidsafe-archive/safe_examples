import React, { Component } from 'react';

export default class FileSelector extends Component {

  newFile(e) {
    e.preventDefault();
    let filename = this.refs.filename.value.trim();
    if (!filename) return;
    this.props.onSelectFile(filename);
  }

  render() {
    let files = <p><em>no files yet</em></p>;
    if (this.props.files.length) {
      files = (
        <ul className="file-ls">
          {this.props.files.map((f) => {
            let fileName = f;
            if (f.split('.').slice(-1)[0] !== 'md') {
              fileName += '.md';
            }
            return <li onClick={() => this.props.onSelectFile(f)}><span className="icn">{fileName[0]}</span>{fileName}</li>;
          })}
        </ul>
      );
    }

    return (
      <div className="fileSelector">
        <h3 className="headers-2">Select the file you want to edit</h3>
        {files}

        <div className="create-new">
          <form>
            <input ref="filename" placeholder="Create new file"/>
            <button className="btn pr-btn" type="submit" onClick={this.newFile.bind(this)}>Create</button>
          </form>
        </div>
      </div>
    );
  }
}
