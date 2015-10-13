/**
* Manage the TCP connection with the Launcher
*/

var Connection = function() {
  var net = require('net');
  var socket;
  var onDataRecievedListener;
  var onConnectionClosedListener;
  var alive = false;
  var HOST = 'localhost';

  var setOnDataRecievedListener =  function(listnerCallback) {
    onDataRecievedListener = listnerCallback;
  };

  var setOnConnectionClosedListener = function(listnerCallback) {
    onConnectionClosedListener = listnerCallback;
  };

  var OPTIONS = {
    'onData': setOnDataRecievedListener,
    'onClosed': setOnConnectionClosedListener,
  };

  var setFromOptions = function(options) {
    for (var key in OPTIONS) {
      if (!options.hasOwnProperty(key)) {
        continue;
      }
      OPTIONS[key](options[key]);
    }
  };

  var onDataRecieved = function(data) {
    if (!onDataRecievedListener) {
      return;
    }
    onDataRecievedListener(data);
  };

  var onConnectionClosed = function() {
    alive = false;
    if (!onConnectionClosedListener) {
      return;
    }
    onConnectionClosedListener(data);
  };

  /**
  * connect function is invoked to connect to a port on the local machine
  * callback will be invoked only when the connection is successful
  * else the onClosed listener will be invoked if the connection fails
  */
  this.connect = function(portNumber, callback, options) {
    if (options) {
      setFromOptions(options);
    }
    socket =  new net.Socket();
    socket.on('data', onDataRecieved);
    socket.on('close', onConnectionClosed);
    socket.connect(portNumber, HOST, function() {
      alive = true;
      callback();
    });
  };

  this.send = socket.write;

  this.isAlive = function() {
    return alive;
  };

  this.setOnDataRecievedListener = setOnDataRecievedListener;

  this.setOnConnectionClosedListener = setOnConnectionClosedListener;

};

exports = module.exports = new Connection();
