import { Button, Card, Icon } from 'antd';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { I18n } from 'react-redux-i18n';

export default class Auth extends Component {
  componentDidMount() {
    if (!this.props.isRevoked) {
      this.props.connect();
    }
  }

  componentWillUpdate(props) {
    if (!this.props.isRevoked && props.fetchedServices && !props.serviceError) {
      props.router.replace('/home');
    }
  }

  componentDidUpdate() {
    if (this.props.isConnected && !this.props.fetchedAccessInfo && !this.props.accessInfoError) {
      return this.props.getAccessInfo();
    }
    if (this.props.fetchedAccessInfo && !this.props.fetchedPublicNames && !this.props.publicNameError) {
      return this.props.getPublicNames();
    }
    if (this.props.fetchedPublicNames && !this.props.fetchedPublicContainers && !this.props.publicContainersError) {
      return this.props.getPublicContainers();
    }
    if (this.props.fetchedPublicContainers && !this.props.fetchedServices && !this.props.serviceError) {
      return this.props.getServices();
    }
  }

  reconnect() {
    this.props.reset();
    this.props.connect();
  }

  getDisplayContent() {
    if (this.props.isRevoked) {
      return {
        title: I18n.t('label.initialising.revoked'),
        content: (<div className="error-cntr">
          <div>Application got revoked. Please Reauthorise.</div>
          <Button type="primary" onClick={this.reconnect.bind(this)}>Re-Authorise</Button>
        </div>)
      };
    }
    if (this.props.authError) {
      return {
        title: I18n.t('label.initialising.authErrorTitle'),
        content: (<div className="error-cntr">
          <div>
            { this.props.authError }
          </div>
          <Button type="primary" onClick={this.reconnect.bind(this)}>Retry</Button>
        </div>)
      };
    }
    if (this.props.connectionError) {
      return {
        title: I18n.t('label.initialising.connectionErrorTitle'),
        content: (<div>
          <div>
            { this.props.connectionError }
          </div>
          <Button type="primary" onClick={this.reconnect.bind(this)}>Retry</Button>
        </div>)
      };
    }
    if (this.props.accessInfoError || this.props.publicNameError
      || this.props.publicContainersError || this.props.serviceError) {
      return {
        title: I18n.t('label.initialising.appErrorTitle'),
        content: (<div>
          <div>
            { this.props.accessInfoError || this.props.publicNameError || this.props.serviceError }
          </div>
          <Button type="primary" onClick={this.reconnect.bind(this)}>Retry</Button>
        </div>)
      };
    }
    if (this.props.isAuthorising) {
      return {
        title: I18n.t('label.waitingForAuth.title'),
        content: (<div>
          { I18n.t('label.waitingForAuth.line1') }
          <br />
          { I18n.t('label.waitingForAuth.line2-1') }&nbsp;<b><i>_publicNames & _public</i></b>&nbsp;
          { I18n.t('label.waitingForAuth.line2-2') }
          <br /><br />
          { I18n.t('label.waitingForAuth.line3-1') }&nbsp;<b><i>_publicNames</i></b>&nbsp;
          { I18n.t('label.waitingForAuth.line3-2') }
          <br /><br />
          { I18n.t('label.waitingForAuth.line4') }
          <br />
          <i>
            { I18n.t('label.waitingForAuth.line5-1') } &gt; { I18n.t('label.waitingForAuth.line5-2') }
          </i>
        </div>)
      };
    }
    return {
      title: I18n.t('label.initialising.title'),
      content: (
        <ul className='initialise-list'>
          <li>
            <Icon type={this.props.isConnecting ? 'loading' : (this.props.isConnected ? 'check' : 'ellipsis')} />
            { I18n.t('label.initialising.connecting') }
          </li>
          <li>
            <Icon type={this.props.fetchingAccessInfo ? 'loading' :
              (this.props.fetchedAccessInfo ? 'check' : 'ellipsis')} />
            { I18n.t('label.initialising.accessContainer') }
          </li>
          <li>
            <Icon type={this.props.fetchingPublicNames ? 'loading' :
              (this.props.fetchedPublicNames ? 'check' : 'ellipsis')} />
            { I18n.t('label.initialising.publicNamesContainer') }
          </li>
          <li>
            <Icon type={this.props.fetchingPublicContainers ? 'loading' :
              (this.props.fetchedPublicContainers ? 'check' : 'ellipsis')} />
            { I18n.t('label.initialising.publicContainers') }
          </li>
          <li>
            <Icon type={this.props.fetchingServices ? 'loading' : 'ellipsis'} />
            { I18n.t('label.initialising.preparingApp') }
          </li>
        </ul>
      )
    };
  }

  render() {
    const data = this.getDisplayContent();
    const hasError = (this.props.authError || this.props.connectionError);
    const errorClass = hasError ? 'error' : '';
    return (
      <div className={ `auth-wrapper ${errorClass}` }>
        <Card title={data.title} bordered={false}>
          { data.content }
        </Card>
      </div>
    );
  }
}

Auth.propTypes = {
  connect: PropTypes.func.isRequired,
  getAccessInfo: PropTypes.func.isRequired,
  getPublicNames: PropTypes.func.isRequired,
  getServices: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,

  authError: PropTypes.string,
  isAuthorising: PropTypes.bool.isRequired,
  isAuthorised: PropTypes.bool.isRequired,

  isConnecting: PropTypes.bool.isRequired,
  isConnected: PropTypes.bool.isRequired,
  connectionError: PropTypes.string,

  fetchingAccessInfo: PropTypes.bool.isRequired,
  fetchedAccessInfo: PropTypes.bool.isRequired,
  accessInfoError: PropTypes.string,

  fetchingPublicNames: PropTypes.bool.isRequired,
  fetchedPublicNames: PropTypes.bool.isRequired,
  publicNameError: PropTypes.string,

  fetchingServices: PropTypes.bool.isRequired,
  fetchedServices: PropTypes.bool.isRequired,
  serviceError: PropTypes.string,

  fetchingPublicContainers: PropTypes.bool.isRequired,
  fetchedPublicContainers: PropTypes.bool.isRequired,
  publicContainersError: PropTypes.string,
};
