/**
* Manage the Request
*/
var RequestManager = function(portNumber, launcherString, nonce, onReadyCallback) {
  var connectionManager = require('./connection_manager');
  var sodium = require('libsodium-wrappers');
  var log = require('npmlog');

  var encryptionKey;
  var encryptionNonce;
  var KEY_SIZE = {
    SYMMETRIC_KEY : 32,
    NONCE         : 24
  };
  var self = this;
  var callbackPool = {};

  var getValuesFromMap = function(map) {
    var values = [];
    for (var k in map) {
      values.push(map[k]);
    }
    return values;
  };

  var convertArrayAsMap = function(array) {
    var map = {};
    for (var i in array) {
      map[i.toString()] = array[i];
    }
    return map;
  };

  var addToCallbackPool = function(request, callback) {
    var id = getValuesFromMap(sodium.crypto_hash(request));
    var callbacksRegistered = callbackPool.hasOwnProperty(id) ? callbackPool[id] : [];
    callbacksRegistered.push(callback);
    callbackPool[id] = callbacksRegistered;
  };

  var encrypt = function(data) {
    return getValuesFromMap(sodium.crypto_secretbox_easy(data, encryptionNonce, encryptionKey));
  };

  var decrypt = function(data) {
    var cipher = convertArrayAsMap(data);
    var decryptedData = sodium.crypto_secretbox_open_easy(cipher, encryptionNonce, encryptionKey);
    return new Buffer(getValuesFromMap(decryptedData)).toString();
  };

  var onHandShakeComplete = function(err, handshakeResponse) {
    if (err) {
        onReadyCallback('Handshake failed with launcher - ' + err);
        return;
    }
    // TODO get encryptionKey & encryptionNonce
    onReadyCallback(null, self);
  };

  var handshake = function() {
    // send Handshake request - MAID 1464
  };


  var onDataRecieved = function(data) {
    log.verbose('Data recieved from launcher :' + data);
    var response;
    try {
      response = = decrypt(data);
      log.verbose('Decrypted Response :' + response);
      if (!callbackPool.hasOwnProperty(response.id)) {
        return;
      }
      log.verbose('Invoking Callbacks');
      for (var i in callbackPool[response.id]) {
        callbackPool[i](response.error_code, response.data);
      }
      delete callbackPool[id];
    } catch(ex) {
      console.error(ex);
    }
  };

  var onConnectionClosed = function() {
    log.error('Launcher socket connection closed');
  };

  self.send = function(request, callback) {
    log.verbose('Sending Request :' + request);
    addToCallbackPool(request, callback);
    connectionManager.send(encrypt(request));
  };

  log.verbose('Trying to connect with laucher');
  connectionManager.connect(port, handshake, {
    'onData': onDataRecieved,
    'onClosed': onConnectionClosed
  });

  return;
};

exports = module.exports = RequestManager;
