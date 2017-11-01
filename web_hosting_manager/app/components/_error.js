import React from 'react';
import lodash from 'lodash';
import { NavLink } from 'react-router-dom';

const Error = (element) => {
  const logEle = (<NavLink key="logLink" to="/appLogs">View Logs</NavLink>);
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
