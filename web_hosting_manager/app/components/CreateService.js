import React, { Component, PropTypes } from 'react';
import { Button, Card, Input, Select, Icon } from 'antd';
import { I18n } from 'react-redux-i18n';

import Nav from './Nav';

export default class CreateService extends Component {
  static propTypes = {
    isConnecting: PropTypes.bool.isRequired,
    isConnected: PropTypes.bool.isRequired,
    connectionError: PropTypes.string,
    creatingService: PropTypes.bool.isRequired,
    serviceError: PropTypes.string,
    fetchingPublicContainers: PropTypes.bool.isRequired,
    publicContainers: PropTypes.array.isRequired,
    publicContainersError: PropTypes.string,
    params: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
    createContainerAndService: PropTypes.func.isRequired,
    createService: PropTypes.func.isRequired,
    getPublicContainers: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.containerName = '';
    this.state = {
      serviceName: '',
      containerName: '',
      isCreatingContainerAndService: false,
      serviceError: '',
      containerError: ''
    };
  }

  componentDidMount() {
    this.refs.serviceName.refs.input.focus();
    this.containerName = this.props.publicContainers[0];
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.creatingService && !nextProps.creatingService && nextProps.serviceError) {
      this.setState({
        isCreatingContainerAndService: false
      });
    } else if (this.props.creatingService && !nextProps.creatingService) {
      this.props.router.goBack();
    }
  }

  componentWillUnmount() {
    this.props.clearNotification();
  }

  validate() {
    let valid = true;
    const serviceErrorMsg = I18n.t('messages.emptyServiceName');
    const containerNameErrorMsg = I18n.t('messages.emptyConatinerName');
    if (!this.state.serviceName && !this.state.containerName) {
      this.setState({
        serviceError: serviceErrorMsg,
        containerError: containerNameErrorMsg
      });
      valid = false;
    } else if (!this.state.serviceName) {
      this.setState({
        serviceError: serviceErrorMsg
      });
      valid = false;
    } else if (!this.state.containerName) {
      this.setState({
        containerError: containerNameErrorMsg
      });
      valid = false;
    }
    return valid;
  }

  createContainerAndService() {
    if (!this.validate()) {
      return;
    }
    this.setState({
      isCreatingContainerAndService: true
    });
    this.props.createContainerAndService(this.props.params.publicId, this.state.serviceName,
      this.state.containerName, '_public');
  }

  createService() {
    if (!this.state.serviceName) {
      return this.setState({
        serviceError: I18n.t('messages.emptyServiceName')
      });
    }
    this.props.createService(this.props.params.publicId, this.state.serviceName,
      this.containerName, '_public');
  }

  onContainerChanged(key) {
    this.containerName = key;
  }

  watchServiceName(event) {
    this.setState({
      serviceName: event.target.value,
      containerName: event.target.value ? `${event.target.value}-root` : event.target.value
    });
  }

  watchContainerName(event) {
    this.setState({
      containerName: event.target.value.trim()
    });
  }

  render() {
    const Option = Select.Option;
    const publicContainers = this.props.publicContainers.map((containerName) => {
      return (
        <Option value={containerName} key={containerName}>{containerName}</Option>
      );
    });
    return (
      <div>
        <Nav title={I18n.t('messages.createService')} back={this.props.router.goBack}></Nav>
        <div className="wrapper custom-card create-service">
          <Card className="create-service-b">
            <div className="create-service-input">
              <Input size="large" ref="serviceName" addonBefore="safe://" addonAfter={`.${this.props.params.publicId}`}
                     placeholder={I18n.t('messages.serviceNamePlaceholder')}
                     onChange={this.watchServiceName.bind(this)}
                     value={this.state.serviceName}/>
              <div className="error-msg">
                {!this.props.creatingService &&
                (this.state.serviceError || this.props.serviceError)}
              </div>
            </div>
            <div className="split-cntr">
              <div className="split-cntr-i">
                <h3>{I18n.t('label.createNewContainer')}</h3>
                <Input ref="containerName" placeholder={I18n.t('messages.containerNamePlaceholder')}
                       value={this.state.containerName}
                       onChange={this.watchContainerName.bind(this)}
                />
                <div className="error-msg">{this.state.containerError}</div>
                <Button
                  type="primary"
                  loading={this.state.isCreatingContainerAndService && this.props.creatingService}
                  onClick={this.createContainerAndService.bind(this)}
                  disabled={!this.state.containerName}
                >
                  {I18n.t('label.createService')}
                </Button>
              </div>
              <div className="split-cntr-divider">
                <b><i>{I18n.t('label.or')}</i></b>
              </div>
              <div className="split-cntr-i">
                <h3>{I18n.t('label.selectContainer')}</h3>
                <div className="custom-btn-grp">
                  <Select ref="containerDropdown"
                          defaultValue={this.props.publicContainers[0]}
                          onChange={this.onContainerChanged.bind(this)}
                          placeholder={I18n.t('messages.noContainerPlaceHolder')}
                  >
                    { publicContainers }
                  </Select>
                  <Button
                    disabled={(this.props.publicContainers.length === 0) || (this.state.isCreatingContainerAndService && this.props.creatingService)}
                    onClick={() => this.props.getPublicContainers()}
                  ><Icon type="reload"/></Button>
                </div>
                <Button
                  type="primary" disabled={(this.props.publicContainers.length === 0) || (this.state.isCreatingContainerAndService && this.props.creatingService)}
                  onClick={this.createService.bind(this)}
                  loading={!this.state.isCreatingContainerAndService && this.props.creatingService}
                >
                  {I18n.t('label.createService')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }
}
