import { Button, Card, Collapse, Input, Modal, Row, Col, Select, Icon } from 'antd';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { I18n } from 'react-redux-i18n';
import { Link } from 'react-router';
import NetworkStatus from './NetworkStatus';

import Nav from './Nav';

export default class Auth extends Component {
  static propTypes = {
    connect: PropTypes.func.isRequired,
    getAccessInfo: PropTypes.func.isRequired,
    getPublicNames: PropTypes.func.isRequired,
    getPublicContainers: PropTypes.func.isRequired,
    createPublicId: PropTypes.func.isRequired,
    remapService: PropTypes.func.isRequired,

    isConnecting: PropTypes.bool.isRequired,
    isConnected: PropTypes.bool.isRequired,
    connectionError: PropTypes.string,

    fetchingAccessInfo: PropTypes.bool.isRequired,
    fetchedAccessInfo: PropTypes.bool.isRequired,
    accessInfoError: PropTypes.string,

    fetchingPublicNames: PropTypes.bool.isRequired,
    publicNames: PropTypes.object.isRequired,
    creatingPublicId: PropTypes.bool.isRequired,
    publicIdError: PropTypes.string,

    remapping: PropTypes.bool.isRequired,
    serviceError: PropTypes.string,

    publicContainers: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      newPublicId: '',
      publicIdVisible: false,
      showRemapModal: false
    };
    this.remap = {
      containerName: '',
      publicId: '',
      service: ''
    };
    this.reloadingContainer = false;
  }

  componentDidMount() {
    if (Object.keys(this.props.publicNames).length === 0) {
      this.refs.publicId.refs.input.focus();
    }
  }

  componentWillUpdate(nextProps) {

    if (nextProps.fetchingPublicContainers) {
      this.reloadingContainer = true;
    }

    if (this.state.showRemapModal && !this.reloadingContainer && !nextProps.remapping && !nextProps.serviceError) {
      this.hideRemapModal();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.refs.publicId && prevProps.creatingPublicId &&
      !this.props.creatingPublicId && !this.props.publicIdError) {
      this.resetPublicIdModal();
    }
    if (!this.props.fetchingPublicContainers) {
      this.reloadingContainer = false;
    }
  }

  createPublicId() {
    if (this.props.creatingPublicId) {
      return;
    }
    this.props.createPublicId(this.state.newPublicId);
  }

  cancelpublicId() {
    this.refs.publicId.refs.input.value = '';
    this.resetPublicIdModal();
  }

  resetPublicIdModal() {
    this.setState({
      newPublicId: '',
      publicIdVisible: false
    });
  }

  showNewPublicId() {
    this.setState({
      newPublicId: '',
      publicIdVisible: true
    });
    setTimeout(() => {
      this.refs.publicId.refs.input.value = '';
      this.refs.publicId.refs.input.focus();
    }, 200);
  }

  publicIdModal() {
    return (
      <div>
        <Modal
          title={I18n.t('label.createPublicId')}
          visible={this.state.publicIdVisible}
          onOk={this.createPublicId.bind(this)}
          confirmLoading={this.props.creatingPublicId}
          onCancel={this.cancelpublicId.bind(this)}
          okText={I18n.t('label.ok')}
          cancelText={I18n.t('label.cancel')}
        >
          <div>
            <Input
              className={((!this.props.creatingPublicId) && this.props.publicIdError) ? 'inp-error' : ''}
              ref="publicId" addonBefore="safe://" onChange={this.watchPublicId.bind(this)}
              placeholder={I18n.t('label.enterPublicId')}
              onPressEnter={this.createPublicId.bind(this)}
            />
            <div className="error-msg">{this.props.creatingPublicId ? '' : this.props.publicIdError}</div>
          </div>
        </Modal>
      </div>
    );
  }

  watchPublicId(event) {
    this.setState({
      newPublicId: event.target.value
    });
  }

  onContainerChanged(key) {
    this.remap.containerName = key;
  }

  remapService() {
    this.props.remapService(this.remap.service, this.remap.publicId, this.remap.containerName);
  }

  remapModal() {
    const Option = Select.Option;
    const publicContainers = this.props.publicContainers.map((containerName) => {
      return (
        <Option value={containerName} key={containerName}>{containerName}</Option>
      );
    });
    return (
      <div className="popup">
        <Modal
          title={I18n.t('label.remapTitle', this.remap)}
          visible={this.state.showRemapModal}
          onOk={this.remapService.bind(this)}
          confirmLoading={this.props.remapping}
          onCancel={this.hideRemapModal.bind(this)}
          okText={I18n.t('label.ok')}
          cancelText={I18n.t('label.close')}
        >
          <div className="popup-cnt">
            <h4 className="head">{I18n.t('label.selectContainer')}</h4>
            <div className="custom-btn-grp">
              <Select size="large" ref="containerDropdown" style={{ width: '90%', marginBottom: '10px' }}
                      defaultValue={this.props.publicContainers[0]}
                      onChange={this.onContainerChanged.bind(this)}
                      placeholder={I18n.t('messages.noContainerPlaceHolder')}
              >
                { publicContainers }
              </Select>
              <Button
                className="lg"
                onClick={() => {
                  this.props.getPublicContainers();
                }}
              ><Icon type="reload"/></Button>
            </div>
            <div className="error-msg">{this.props.remapping ? '' : this.props.serviceError}</div>
          </div>
        </Modal>
      </div>
    );
  }

  hideRemapModal() {
    this.remap = {
      containerName: '',
      publicId: '',
      service: ''
    };
    this.setState({
      showRemapModal: false
    });
  }

  showRemapModal(service, publicId) {
    const defaultContainer = this.props.publicContainers[0];
    this.remap = {
      containerName: defaultContainer,
      publicId,
      service
    };
    this.setState({
      showRemapModal: true
    });
  }

  createPublicIdView() {
    return (
      <Card title={I18n.t('label.createPublicId')}>
        <div>
          <p className="description">{I18n.t('label.noPublicIdText')}</p>
          <Input
            size="large"
            className={((!this.props.creatingPublicId) && this.props.publicIdError) ? 'inp-error' : ''}
            ref="publicId" addonBefore="safe://" onChange={this.watchPublicId.bind(this)}
            defaultValue={this.state.newPublicId} placeholder={I18n.t('messages.publicIdPlaceholder')}
            onPressEnter={this.createPublicId.bind(this)}
          />
          <div className="error-msg">{this.props.creatingPublicId ? '' : this.props.publicIdError}</div>
          <Button
            type="primary" onClick={this.createPublicId.bind(this)}
            loading={this.props.creatingPublicId}
          >
            { I18n.t(this.props.creatingPublicId ? 'label.creating' : 'label.create') }
          </Button>
        </div>
      </Card>
    );
  }

  getAccordianView() {
    const Panel = Collapse.Panel;
    const layout = (publicId, ele) => {
      return (
        <div>
          <Row>
            <Col lg={{span:8, offset: 16}} md={{span:8, offset: 16}}>
              <div className="link-btn">
                <Link to={`/service/${publicId}`}>{I18n.t('label.createService')}</Link>
              </div>
            </Col>
          </Row>
          <div className="service-list">
            { ele }
          </div>
        </div>
      );
    };
    const noServicesView = (publicId) => {
      return layout(publicId, <div className="default">No service found</div>);
    };
    const serviceListView = (publicId) => {
      const servicesList = Object.keys(this.props.publicNames[publicId]).map((serviceName, i) => {
        const servicePath = this.props.publicNames[publicId][serviceName];
        return (
          <Row key={ `serviceName-${i}`}>
            <Col md={{ span: 8 }} lg={{ span: 8 }}>
              <a href={`safe://${serviceName}.${publicId}/index.html`}>{serviceName}</a>
            </Col>
            <Col md={{ span: 10 }} lg={{ span: 10 }}>
              <Link
                to={`files/${serviceName}/${publicId}/${encodeURIComponent(servicePath)}`}
              >
                {servicePath}
              </Link>
            </Col>
            <Col md={{ span: 3 }} lg={{ span: 3 }}>
              <Button onClick={() => this.showRemapModal(serviceName, publicId)}>
                {I18n.t('label.remap')}
              </Button>
            </Col>
            <Col md={{ span: 3 }} lg={{ span: 3 }}>
              <Button onClick={() => { this.props.deleteService(publicId, serviceName); }}>{I18n.t('label.delete')}</Button>
            </Col>
          </Row>
        );
      });
      return layout(publicId, servicesList);
    };
    const panels = Object.keys(this.props.publicNames).map((publicId, i) => {
      const hasNoServices = Object.keys(this.props.publicNames[publicId]).length === 0;
      const services = hasNoServices ?
        noServicesView(publicId) : serviceListView(publicId);
      return (
        <Panel header={publicId} key={i}>
          {services}
        </Panel>
      );
    });
    return (
      <div>
        <div className="custom-card-top-opt">
          <div className="itm">
            <Button onClick={() => this.showNewPublicId()}>Create public Id</Button>
          </div>
        </div>
        <Collapse accordion defaultActiveKey={['0']}>
          { panels }
        </Collapse>
      </div>
    );
  }

  getNetworkStatus() {
    return {
      status: this.props.isConnected ? 1 : 0,
      message: this.props.isConnected ? I18n.t('label.networkStatus.connected') : I18n.t('label.networkStatus.connecting')
    };
  }

  render() {
    const ele = Object.keys(this.props.publicNames).length === 0 ? this.createPublicIdView() : this.getAccordianView();
    const networkStatus = this.getNetworkStatus();
    return (
      <div>
        <Nav title={I18n.t('label.home')} />
        <div className="wrapper custom-card">
          <div className="home-overflow">
            { ele }
          </div>
        </div>
        { this.publicIdModal() }
        { this.remapModal() }
        <NetworkStatus status={networkStatus.status} message={networkStatus.message} />
      </div>
    );
  }
}
