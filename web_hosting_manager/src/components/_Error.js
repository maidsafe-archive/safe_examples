import React from 'react';
import lodash from 'lodash';

import api from '../lib/api';

const Error = (element) => {
const logEle = (<a
                  key="log"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    api.openLogFile();
                  }}
                >View Logs</a>);
  const children = [];
  lodash.isArray(element.props.children) ? children.concat(element.props.children) : children.push(element.props.children);
  children.push(' ');
  children.push(logEle);
  return React.cloneElement(element, {}, children);
};

export default Error;
