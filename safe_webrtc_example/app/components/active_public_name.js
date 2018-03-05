import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from "mobx-react";
import CONST from '../constants';

@inject("store")
@observer
export default class ActivePublicName extends Component {
  render() {
    const { history, publicName, disableOptions } = this.props;

    return (
      <div className="active-public-name">
        <div className="active-public-name-b">
          <div className="label">{CONST.UI.LABELS.activePubName}</div>
          <div className="value">{publicName}</div>
          {!disableOptions ? (<div className="opt">
            <button className="btn" onClick={() => {
              history.push('switch-public-name');
            }}>{CONST.UI.LABELS.switch}</button>
          </div>) : null}
        </div>
      </div>
    );
  }
}

ActivePublicName.propTypes = {
};
