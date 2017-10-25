// @flow
import fs from 'fs';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import tempWrite from 'temp-write';

import CONSTANTS from '../constants';
import Base from './_Base';
import WizardNav from './WizardNav';
import * as utils from '../utils/app';

export default class WithTemplate extends Component {
  constructor() {
    super();
    this.state = {
      editTitle: false,
      editDesc: false,
      title: 'Safe Network sample site',
      description: 'This is a sample website to host at Safe Network',
    };
  }

  componentDidUpdate() {
    if (this.props.published && !this.props.processing) {
      return this.props.history.push('/publicNames');
    }
  }

  componentWillUnmount() {
    this.props.reset();
  }

  handlePublish(e) {
    e.preventDefault();
    const { publicName, serviceName } = this.props.match.params;
    const templateDir = process.env.NODE_ENV === CONSTANTS.ENV.DEV ?
      CONSTANTS.DEV_TEMPLATE_PATH : CONSTANTS.ASAR_TEMPLATE_PATH;
    const templateFilePath = `${templateDir}/_index.html`;
    try {
      const indexFile = fs.readFileSync(templateFilePath);
      const updatedContent = indexFile.toString().replace('%pt', this.state.title).replace('%t', this.state.title).replace('%d', this.state.description);
      const tempFile = tempWrite.sync(updatedContent, 'index.html');
      const filesToUpload = [
        tempFile,
        `${templateDir}/main.css`,
      ];
      const containerPath = `_public/${publicName}/${utils.defaultServiceContainerName(serviceName)}`;
      this.props.publishTemplate(publicName, serviceName, containerPath, filesToUpload);
    } catch (err) {
      console.error('Handle publish error :: ', err);
    }
  }

  popupOkCb() {
    this.props.reset();
  }

  render() {
    const { publicName } = this.props.match.params;

    return (
      <Base
        reconnect={this.props.reconnect}
        nwState={this.props.nwState}
        processing={this.props.processing}
        error={this.props.error}
        processDesc={this.props.processDesc}
        popupOkCb={this.popupOkCb.bind(this)}
      >
        <div>
          <WizardNav history={this.props.history} />
          <div className="template">
            <div className="banner">
              <div className="title">
                {
                  this.state.editTitle ? (
                    <input
                      type="text"
                      value={this.state.title}
                      onChange={(e) => {
                        const { value } = e.target;
                        this.setState({
                          title: value,
                        });
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          this.setState({
                            editTitle: false,
                          });
                        }
                      }}
                    />) : (
                      <h3
                        onClick={() => {
                          this.setState({
                            editTitle: true,
                          });
                        }}
                      >{this.state.title}
                      </h3>)
                }
              </div>
            </div>
            <div className="context">
              {
                this.state.editDesc ? (
                  <input
                    type="text"
                    value={this.state.description}
                    onChange={(e) => {
                      const { value } = e.target;
                      this.setState({
                        description: value,
                      });
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        this.setState({
                          editDesc: false,
                        });
                      }
                    }}
                  />) : (
                    <h3
                      onClick={() => {
                        this.setState({
                          editDesc: true,
                        });
                      }}
                    >{this.state.description}
                    </h3>)
              }
            </div>
          </div>
          <div className="card">
            <div className="card-b">
              <div className="opts">
                <div className="opt">
                  <button
                    type="button"
                    className="btn flat"
                    onClick={(e) => {
                      e.preventDefault();
                      this.props.history.push(`/newWebSite/${publicName}`);
                    }}
                  >Cancel
                  </button>
                </div>
                <div className="opt">
                  <button
                    type="button"
                    className="btn flat primary"
                    onClick={this.handlePublish.bind(this)}
                  >Publish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Base>
    );
  }
}

WithTemplate.propTypes = {
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  processDesc: PropTypes.string.isRequired,
  error: PropTypes.string.isRequired,
  nwState: PropTypes.string.isRequired,
  published: PropTypes.bool.isRequired,
  processing: PropTypes.bool.isRequired,
  reconnect: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  publishTemplate: PropTypes.func.isRequired,
};
