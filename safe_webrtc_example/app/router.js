import React from 'react';
import { Switch, Route } from 'react-router';
import App from './components/app';
import Home from './components/home';
import SwitchID from './components/switch_id';
import Invites from './components/invites';
import NewChat from './components/new_chat';
import ChatRoom from './components/chat_room';

export default () => (
  <App>
    <Switch>
      <Route path="/chat-room/:friendId?/:uid?" component={ChatRoom} />
      <Route path="/new-chat" component={NewChat} />
      <Route path="/invites" component={Invites} />
      <Route path="/switch-id" component={SwitchID} />
      <Route path="/" component={Home} />
    </Switch>
  </App>
);
