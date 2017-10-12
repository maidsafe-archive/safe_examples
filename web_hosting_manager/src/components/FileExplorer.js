// @flow

import { remote } from 'electron';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CONSTANTS from '../constants';
import {bytesToSize} from '../utils/app';

export default class FileExplorer extends Component {
  constructor() {
    super();
    this.state = {
      showUploadMenu: false,
      currentPath: null
    };
    this.getFolderEle = this.getFolderEle.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.isRootFolder = this.isRootFolder.bind(this);
    this.getStatus = this.getStatus.bind(this);
    this.cancelUpload = this.cancelUpload.bind(this);
    this.cancelDownload = this.cancelDownload.bind(this);
  }

  getCurrentPath() {
    return this.state.currentPath || this.props.rootPath
  }

  isRootFolder() {
    return (!this.state.currentPath || (this.state.currentPath === this.props.rootPath));
  }

  handleDelete(name) {
    this.props.deleteFileOrDir(this.getCurrentPath(), name);
  }

  levelBack() {
    console.log('level back')
    if (!this.state.currentPath) {
      return;
    }
    const pathArr = this.state.currentPath.split('/');
    pathArr.pop();
    const previousPath = pathArr.join('/');
    this.setState({
      currentPath: previousPath
    });
    this.props.getContainerInfo(previousPath);
  }

  chooseUploadMenu(onlyFile) {
    this.setState({
      showUploadMenu: !this.state.showUploadMenu
    });
    remote.dialog.showOpenDialog({
      title: onlyFile ? 'Select File' : 'Felect Folder',
      properties: onlyFile ? ['openFile', 'multiSelections'] : ['openDirectory', 'multiSelections']
    }, (selection) => {
      if (!selection || selection.length === 0) {
        return;
      }
      selection.forEach((filePath) => {
        this.props.upload(filePath, this.getCurrentPath());
      });
    });
  }

  cancelUpload() {
    return this.props.cancelUploadAndReloadContainer(this.getCurrentPath());
  }

  cancelDownload() {
    this.props.cancelDownload();
  }

  getUploadBtn() {
    const progress = `${this.props.uploadStatus ? this.props.uploadStatus.progress : 0}%`;

    const uploadMenu = this.state.showUploadMenu ? (
      <div className="menu">
      <div
        className="menu-i"
        onClick={() => {this.chooseUploadMenu(true)}}
      >Upload Files</div>
      <div
        className="menu-i"
        onClick={() => {this.chooseUploadMenu()}}
      >Upload Folder</div>
    </div>
    ) : null;

    const uploadBaseCn = classNames('upload-btn-b', 'active', {
      'cancel-btn': this.props.uploading
    });

    return (
      <div className="upload">
        {uploadMenu}
        <div className={uploadBaseCn}>
          <button
            type="button"
            title={CONSTANTS.UI.TOOLTIPS.UPLOAD}
            className="upload-btn"
            onClick={(e) => {
              e.preventDefault();
              if (this.props.uploading) {
                return this.cancelUpload(this);
              }
              this.setState({
                showUploadMenu: !this.state.showUploadMenu
              });
            }}
          >{''}</button>
        </div>
        <span className="progress-bar" style={{width: progress}}>{''}</span>
      </div>
    )
  }

  getFileEle(name, sizeInBytes, key) {
    return (
      <div
        className="i file"
        key={key}
        onDoubleClick={(e) => {
          e.preventDefault();
          const path = `${this.getCurrentPath()}/${name}`;
          this.props.downloadFile(path);
        }}
      >
        <div className="i-b">
          <span className="name">{name}</span>
          <span className="size">{bytesToSize(sizeInBytes)}</span>
        </div>
        <div className="opt">
          <button
            type="button"
            className="delete-btn"
            title={CONSTANTS.UI.TOOLTIPS.DELETE_FILE}
            onClick={(e) => {
              e.preventDefault();
              this.handleDelete(name);
            }}
          >{''}</button>
        </div>
      </div>
    );
  }

  getFolderEle(name, key) {
    return (
      <div
        className="i dir"
        key={key}
        onDoubleClick={(e) => {
          e.preventDefault();
          const path = `${this.getCurrentPath()}/${name}`;
          this.props.getContainerInfo(path)
          this.setState({
            currentPath: path
          });
        }}
      >
        <div className="i-b">
          <span className="name">{name}</span>
        </div>
        <div className="opt">
          <button
            type="button"
            className="delete-btn"
            title={CONSTANTS.UI.TOOLTIPS.DELETE_FOLDER}
            onClick={(e) => {
              e.preventDefault();
              this.handleDelete(name);
            }}
          >{''}</button>
        </div>
      </div>
    )
  }

  getStatus() {
    if (!this.props.uploadStatus) {
      return (<span>{''}</span>);
    }
    return (
      <div className="status">
        {
          `${this.props.uploadStatus.completed.files}/${this.props.uploadStatus.total.files}`
        }
        &nbsp;files uploaded
      </div>
    );
  }

  getDownloadContainer() {
    if (!this.props.downloading && !this.props.downloadStatus) {
      return (<span>{''}</span>);
    }
    return (
      <div className="download">
        <span className="load">{''}</span>
        <span className="title">Downloading file</span>
        <span className="percentage">{this.props.downloadStatus}</span>
        <span className="opt">
          <button
            type="button"
            className="btn"
            onClick={(e) => {
              e.preventDefault();
              this.cancelDownload();
            }}
          >Cancel</button>
        </span>
      </div>
    )
  }

  getNav() {
    let levelBackBtn = null;

    const getRelativePath = () => {
      const currentPath = this.getCurrentPath();
      if (currentPath === this.props.rootPath) {
        return './';
      }
      return `.${currentPath.substr(this.props.rootPath.length)}`;
    };

    if (!this.isRootFolder()) {
      levelBackBtn = (
        <button
          type="button"
          className="file-back-btn"
          title={CONSTANTS.UI.TOOLTIPS.BACK}
          onClick={(e) => {
            e.preventDefault();
            this.levelBack();
          }}
        >{''}</button>
      );
    }

    return (
      <div className="fe-nav">
        <div className="sec-1">
          { levelBackBtn }
        </div>
        <div className="sec-2">
          <h3 className="current-path">{getRelativePath()}</h3>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    // cancel uploading on component destroy
    if (this.props.uploading) {
      this.cancelUpload();
    }

    // cancel downloading on component destroy
    if (this.props.downloading) {
      this.cancelDownload();
    }
  }

  render() {
    return (
      <div className="file-explorer">
        <div className="b">
          {this.getNav()}
          <div className="h">
            <div className="h-b">
              <div className="h-cntr">
                <span className="name">Name</span>
                <span className="size">Size</span>
              </div>
            </div>
          </div>
          <div className="cntr">
            <div className="cntr-b">
              {
                this.props.containerInfo ? this.props.containerInfo.map((item, index) => {
                    if (item.isFile) {
                      return this.getFileEle(item.name, item.size, index);
                    }
                    return this.getFolderEle(item.name, index);
                  }) : null
              }
            </div>
            { this.props.uploading ? (<div className="uploading"></div>) : null }
            {this.getUploadBtn()}
            {this.getDownloadContainer()}
          </div>
          {this.props.uploading ? this.getStatus() : this.getStatus()}
        </div>
      </div>
    );
  }
}

FileExplorer.propTypes = {
};
