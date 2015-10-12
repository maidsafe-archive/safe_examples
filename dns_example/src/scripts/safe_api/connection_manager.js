/**
* Manage the TCP connection with the Launcher
* TODO MAID - 1462
*/
var Connection = function() {
  var onDataRecieved;
  var onConnectionClosed;
  var alive = false;

  this.setOnDataRecievedListener = function(listnerCallback) {
    onDataRecieved = listnerCallback;
  };

  this.setOnConnectionClosedListener = function(listnerCallback) {
    onConnectionClosed = listnerCallback;
  };

  this.startListening = function(portNumber, callback, options) {
    // TODO Create a TCP socket connection and wait
    // options will contain liteners - setOnDataRecievedListener, setOnConnectionClosedListener
    // set alive = true; if the connection is established
  };

  this.send = function(data) {
    // TODO Send Data over the Connection
  }

  this.isAlive = function() {
    return alive;
  };

};

exports = module.exports = new Connection();
