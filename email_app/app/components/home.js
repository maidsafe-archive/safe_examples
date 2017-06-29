import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, IndexLink } from 'react-router';
import Modal from 'react-modal';
import className from 'classnames';
import pkg from '../../package.json';
import { CONSTANTS } from '../constants';

const modalStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

export default class Home extends Component {
  constructor() {
    super();
    this.state = {
      reconnecting: false
    };

    this.reconnect = this.reconnect.bind(this);
  }

  reconnect() {
    this.setState({reconnecting: true});
    return this.props.reconnectApplication()
              .catch((err) => 'not reconnected')
              .then(() => this.setState({reconnecting: false}))
  }

  render() {
    const { router } = this.context;
    const { coreData, inboxSize, savedSize, network_status } = this.props;

    const isNetworkDisconnected = (network_status !== CONSTANTS.NET_STATUS_CONNECTED);

    return (
      <div className="home">
        <Modal
          isOpen={isNetworkDisconnected}
          shouldCloseOnOverlayClick={false}
          style={modalStyles}
          contentLabel="Network connection lost"
        >
          <div className="text-center">
              <div>The application hast lost network connection.</div><br />
              <div>Make sure the network link is up before trying to reconnect.</div><br />
              <button disabled={this.state.reconnecting} className="mdl-button mdl-js-button bg-primary" onClick={this.reconnect}>Reconnect</button>
          </div>
        </Modal>

        <div className="home-b">
          <div className={className('float-btn', { hide: router.isActive('/compose_mail')  })}>
            <button className="mdl-button mdl-js-button mdl-button--fab mdl-button--primary">
              <Link id="new_mail" to="/compose_mail"><i className="material-icons">add</i></Link>
            </button>
          </div>
          <header className="home-head">
            <div className="lt-sec">
              <h3 className="title heading-md"><span className="bold">Email ID: </span>{coreData.id}</h3>
            </div>
            <div className="rt-sec text-right"></div>
          </header>
          <div className="home-cnt mdl-layout mdl-js-layout">
            <div className="home-nav mdl-list">
              <IndexLink className="home-nav-link" activeClassName="active" to="/home">
                <div className="mdl-list__item">
                  <span className="mdl-list__item-primary-content">
                    <i className="material-icons">email</i>
                    <span>Inbox</span>
                  </span>
                  <span className="mdl-list__item-secondary-action">{inboxSize === 0 ? '' : `${inboxSize}`}</span>
                </div>
              </IndexLink>
              <Link className="home-nav-link" activeClassName="active" to="/saved">
                <div className="mdl-list__item">
                  <span className="mdl-list__item-primary-content">
                    <i className="material-icons">drafts</i>
                    <span>Saved</span>
                  </span>
                  <span className="mdl-list__item-secondary-action">{savedSize === 0 ? '' : `${savedSize}`}</span>
                </div>
              </Link>
             </div>
            <div className="home-list-cnt  mdl-layout__content">
              <div className="page-content">{this.props.children}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Home.contextTypes = {
  router: PropTypes.object.isRequired
};
