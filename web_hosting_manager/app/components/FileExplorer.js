import { remote } from 'electron';
import { I18n } from 'react-redux-i18n';
import React, { Component, PropTypes } from 'react';
import { Card, Button, Icon, Row, Col, notification, Popover, Progress } from 'antd';

import Nav from './Nav';

export default class FileExplorer extends Component {

  static propTypes = {
    getContainer: PropTypes.func.isRequired,
    upload: PropTypes.func.isRequired,
    cancelUpload: PropTypes.func.isRequired,
    download: PropTypes.func.isRequired,
    cancelDownload: PropTypes.func.isRequired,
    deleteItem: PropTypes.func.isRequired,
    isConnecting: PropTypes.bool.isRequired,
    isConnected: PropTypes.bool.isRequired,
    connectionError: PropTypes.string,
    fetchingContainer: PropTypes.bool.isRequired,
    deleting: PropTypes.bool.isRequired,
    containerInfo: PropTypes.array.isRequired,
    containerError: PropTypes.string,
    uploading: PropTypes.bool.isRequired,
    uploadStatus: PropTypes.object,
    downloading: PropTypes.bool.isRequired,
    downloadProgress: PropTypes.number.isRequired,
    fileError: PropTypes.string,
    params: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.containerPath = undefined;
    this.currentPath = undefined;
    this.fetchingContainerPath = undefined;
  }

  componentDidMount() {
    this.props.getContainer(this.currentPath);
  }

  componentWillUpdate(nextProps) {
    if (this.props.fetchingContainer && !nextProps.fetchingContainer
      && this.fetchingContainerPath) {
      if (!nextProps.containerError) {
        this.currentPath = this.fetchingContainerPath;
      }
      this.fetchingContainerPath = undefined;
    }
  }

  componentDidUpdate() {
    if (this.props.fileError) {
      notification.error({
        description: this.props.fileError
      });
    }
  }

  componentWillUnmount() {
    this.props.clearNotification();
  }

  bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
      return `0 ${sizes[0]}`;
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) {
      return `${bytes} ${sizes[i]}`;
    }
    const resultStr = (bytes / Math.pow(1024, i)).toFixed(1);
    return `${resultStr} ${sizes[i]}`;
  };

  open(onlyFile) {
    remote.dialog.showOpenDialog({
      title: I18n.t(onlyFile ? 'label.selectFile' : 'label.selectDirectory'),
      properties: onlyFile ? ['openFile'] : ['openDirectory']
    }, (selection) => {
      if (!selection || selection.length === 0) {
        return;
      }
      this.props.upload(selection[0], this.currentPath);
    });
  }

  uploadView() {
    return (
      <ul className="custom-dropdown">
        <li onClick={() => { this.open(false); }}>{ I18n.t('label.uploadDirectory') }</li>
        <li  onClick={() => { this.open(true); }}>{ I18n.t('label.uploadFile') }</li>
      </ul>
    );
  }

  handleListItemClick(item) {
    const path = `${this.currentPath}/${item.name}`;
    if (item.isFile) {
      return this.props.download(path);
    }
    this.fetchingContainerPath = path;
    this.props.getContainer(path);
  }

  handleDelete(item) {
    this.props.deleteItem(this.currentPath, item.name);
  }

  emptyContainer() {
    return (
      <div className="default">
        { (this.props.fetchingContainer || this.props.deleting) ? I18n.t('label.loading') : I18n.t('label.empty') }
      </div>
    );
  }

  showContainer() {
    const list = this.props.containerInfo.map((data, i) => {
      return (
        <Row key={i}>
          <div className="file-list-i">
            <Col md={{span: 1}} lg={{span: 1}}>
              <Icon type={data.isFile ? 'file' : 'folder'}/>
            </Col>
            <Col md={{span: 15}} lg={{span: 15}} style={{ textAlign: 'left', marginLeft: '20px' }}>
              <p onClick={() => { this.handleListItemClick(data); }}>{ data.name }</p>
            </Col>
            <Col md={{span: 4}} lg={{span: 4}}>
              { data.size ? this.bytesToSize(data.size) : '' }
            </Col>
            <Col md={{span: 3}} lg={{span: 3}} onClick={() => { this.handleDelete(data); }}>
              Delete
            </Col>
          </div>
        </Row>
      );
    });
    return (
      <div>
        { list }
      </div>
    );
  }

  levelBack() {
    if (this.fetchingContainer) {
      return;
    }
    const tokens = this.currentPath.split('/');
    tokens.pop();
    this.fetchingContainerPath = tokens.join('/');
    this.props.getContainer(this.fetchingContainerPath);
  }

  explorerView() {
    const uploadPopOver = this.uploadView();
    if (!this.containerPath) {
      this.containerPath = decodeURIComponent(this.props.params.containerPath);
      this.currentPath = this.containerPath;
    }
    return (
      <div className="explorer">
        <div className="options-tray">
          <Row>
            <Col md={{ span: 2 }} lg={{ span: 2 }}>
              <div className="opt-btn">
                <Icon
                  style={{display: (this.currentPath !== this.containerPath) ? 'block': 'none'}}
                  type="left" onClick={() => this.levelBack()}
                />
              </div>
            </Col>
            <Col md={{ span: 20 }} lg={{ span: 20 }}>
              <h3 className="title">{this.currentPath}</h3>
            </Col>
            <Col md={{ span: 2 }} lg={{ span: 2 }}>
              <Popover placement="bottom" content={uploadPopOver} trigger="hover">
                <div className="opt-btn">
                  <Icon type="upload" className="actionable" />
                </div>
              </Popover>
            </Col>
          </Row>
        </div>
        <div className="file-list">
          { this.props.containerInfo.length === 0 || this.props.deleting ?
            this.emptyContainer() : this.showContainer() }
        </div>
      </div>
    );
  }

  uploadProgressIndicator() {
    return (
      <Card style={{ width: 400, position: 'fixed', top: '35%', left: '30%',
        display: this.props.uploading ? 'block': 'none'}}>
        <div>
          <p>
            {I18n.t('label.uploadingMessage')} {this.props.uploadStatus ?
            `${this.props.uploadStatus.completed.files}/${this.props.uploadStatus.total.files}` : ''}
          </p>
          <Progress percent={this.props.uploadStatus ? this.props.uploadStatus.progress : 0} />
          <Button type="primary" onClick={() => {this.props.cancelUpload()}}>
            {I18n.t('label.cancel')}
          </Button>
        </div>
      </Card>
    );
  }

  downloadProgressIndicator() {
    return (
      <Card style={{ width: 400, position: 'fixed', top: '35%', left: '30%',
        display: this.props.downloading ? 'block': 'none'}}>
        <div className="popup-cnt">
          <h4 className="head">{I18n.t('label.downloadingMessage')}</h4>
          <Progress percent={this.props.downloadProgress} />
          <Button type="primary" onClick={() => {this.props.cancelDownload()}}>
            {I18n.t('label.cancel')}
          </Button>
        </div>
      </Card>
    );
  }

  render() {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <Nav
          title={`${I18n.t('label.manageFiles')} - ${this.props.params.service}.${this.props.params.publicId}`}
          back={this.props.router.goBack}
        />
        <div className={'wrapper'}>
          {this.explorerView()}
        </div>
        {this.uploadProgressIndicator()}
        {this.downloadProgressIndicator()}
      </div>
    );
  }
}
