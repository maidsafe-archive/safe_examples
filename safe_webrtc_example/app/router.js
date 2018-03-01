import React from 'react';
import { Switch, Route } from 'react-router';
import App from './components/app';
import Bootstrap from './components/bootstrap';
import Home from './components/home';
import SwitchPublicName from './components/switch_public_name';
import Invites from './components/invites';
import NewChat from './components/new_chat';
import ChatRoom from './components/chat_room';

export default () => (
  <App>
    <Switch>
      <Route path="/home" component={Home} />
      <Route path="/switch-public-name" component={SwitchPublicName} />
      <Route path="/invites" component={Invites} />
      <Route path="/new-chat" component={NewChat} />
      <Route path="/chat-room/:friendId?/:uid?" component={ChatRoom} />
      <Route path="/" component={Bootstrap} />
    </Switch>
  </App>
);
