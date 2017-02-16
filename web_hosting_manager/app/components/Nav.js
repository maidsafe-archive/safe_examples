import React, { Component, PropTypes } from 'react';
import { Icon } from 'antd';

export default class Nav extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired
  }

  backButton() {
    return (
      <div className="nav-btn">
        <Icon type="left" onClick={() => this.props.back()}/>
      </div>
    )
  }

  render() {
    const backBtn = this.props.back ? this.backButton() : '';
    return (
      <nav>
        { backBtn }
        <p className="nav-title">{this.props.title}</p>
      </nav>
    );
  }
}
