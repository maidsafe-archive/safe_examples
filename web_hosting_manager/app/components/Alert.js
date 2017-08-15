import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { I18n } from 'react-redux-i18n';
import { Modal } from 'antd';

export default class Alert extends Component {
  render() {
    return (
        <Modal
        title={this.props.title}
        visible={true}
        closable={false}
        wrapClassName="vertical-center-modal"
        onOk={() => {this.props.onSuccess()}}
        confirmLoading={this.props.loading}
        maskClosable={false}
        onCancel={() => {this.props.onCancel()}}
        okText={I18n.t('label.ok')}
        cancelText={I18n.t('label.close')}
      >{this.props.desc}</Modal>
    );
  }
}

Alert.propTypes = {
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func
};
