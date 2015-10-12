/**
* Manage the Request
* TODO MAID-1463
*/
var RequestManager = function(portNumber, launcherString, nonce, onReadyCallback) {
  var connectionManager = require('./connection_manager');
  var encryptionKey;
  var self = this;

  var onHandShakeComplete = function(err, handshakeResponse) {
    if (err) {
        onReadyCallback('Handshake failed with launcher - ' + err);
        return;
    }
    // TODO get encryptionKey
    onReadyCallback(null, self);
  };

  var handshake = function() {
    // send Handshake request - MAID 1464
  };


  var onDataRecieved = function(data) {
    // TODO disptach to callbacks of the Request
  };

  var onConnectionClosed = function() {
    console.log('Launcher socket connection closed');
  };

  self.send = function(request, callback) {
    // TODO Encrypt and send the request
    // connectionManager.send(request);
  }

  connectionManager.connect(port, handshake, {
    'onData': onDataRecieved,
    'onClosed': onConnectionClosed
  });

  return;
};

exports = module.exports = RequestManager;
