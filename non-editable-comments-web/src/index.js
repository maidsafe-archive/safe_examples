import React from 'react';
import { render } from 'react-dom';
import Constants from './constants';
import CommentList from './components/CommentList';
import CommentListModel from './models/CommentListModel';

import './style/style.css';

const { DEFAULT_ID, ERROR_MSG } = Constants;
const store = new CommentListModel();

const renderApp = (topic, id) => {
  if (!topic) {
    alert(ERROR_MSG.TOPIC_PARAM_MISSING);
    return;
  }
  render(
    <div>
      <CommentList store={store} topic={topic} />
    </div>,
    document.getElementById(id || DEFAULT_ID),
  );
};

window.safeComments = renderApp;
