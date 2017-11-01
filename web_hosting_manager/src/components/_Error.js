import React from 'react';
import lodash from 'lodash';

/* eslint-disable import/no-named-as-default-member, import/no-named-as-default */
import api from '../lib/api';
/* eslint-enable import/no-named-as-default-member, import/no-named-as-default */

const Error = (element) => {
  const logEle = (
    <a
      key="log"
      href="#"
      onClick={(e) => {
        e.preventDefault();
        api.openLogFile();
      }}
    >View Logs
    </a>);
  const children = [];
  if (lodash.isArray(element.props.children)) {
    children.concat(element.props.children);
  } else {
    children.push(element.props.children);
  }
  children.push(' ');
  children.push(logEle);
  return React.cloneElement(element, {}, children);
};

export default Error;
