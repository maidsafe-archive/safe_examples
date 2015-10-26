/**
* Manage the Request
*/
var RequestManager = function(portNumber, launcherString, onReadyCallback) {
  var connectionManager = require('./connection_manager');
  var sodium = require('libsodium-wrappers');
  var log = require('npmlog');

  var encryptionKey;
  var encryptionNonce;
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

  var HandshakeKeys = {
    nonce: null,
    secretKey: null,
    publicKey: null,
    init: function() {
      var keyPair = sodium.crypto_box_keypair();
      this.publicKey = keyPair.publicKey;
      this.secretKey = keyPair.privateKey;
      this.nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    }
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

  var onDataReceived = function(data) {
    log.verbose('Data received from launcher :' + data);
    var response;
    try {
      response = decrypt(data);
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
      log.error(ex);
    }
  };

  var onConnectionClosed = function() {
    log.error('Launcher socket connection closed');
  };

  var onHandShakeComplete = function(handshakeResponse) {
    log.verbose('Handshake response - ' + handshakeResponse);
    handshakeResponse = sodium.crypto_box_open_easy(handshakeResponse, HandshakeKeys.nonce,
                                                    HandshakeKeys.publicKey, HandshakeKeys.secretKey);
    log.verbose('Handshake response (Decrypted) - ' + handshakeResponse);
    if (handshakeResponse.error) {
      log.info('handshake failed - ' + handshakeResponse.error.description);
      log.warn(handshakeResponse.error);
      onReadyCallback('Handshake failed - ' + handshakeResponse.error.description +
                      '(' + handshakeResponse.error.code + ')');
      return;
    }
    encryptionNonce = handshakeResponse.data.splice(0, sodium.crypto_secretbox_NONCEBYTES);
    encryptionKey = handshakeResponse.data;
    connectionManager.setOnDataRecievedListener(onDataReceived);
    onReadyCallback(null, self);
  };

  var handshake = function() {
    var request = {
      "endpoint": "safe-api/v1.0/handshake/authenticate-app",
      "data": {
        "launcher_string": launcherString,
        "nonce": new Buffer(getValuesFromMap(HandshakeKeys.nonce)).toString('base64'),
        "public_encryption_key": new Buffer(getValuesFromMap(HandshakeKeys.publicKey)).toString('base64')
      }
    };
    connectionManager.send(JSON.stringify(request));
  };

  self.send = function(request, callback) {
    log.verbose('Sending Request :' + request);
    addToCallbackPool(request, callback);
    connectionManager.send(encrypt(request));
  };

  HandshakeKeys.init();
  log.verbose('Trying to connect with launcher');
  connectionManager.connect(portNumber, handshake, {
    'onData': onHandShakeComplete,
    'onClosed': onConnectionClosed
  });

  return;
};

exports = module.exports = RequestManager;
