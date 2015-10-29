/**
* Manage the Request
*/
var RequestManager = function(host, portNumber, launcherString, notifierCallback) {
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

  var convertStringAsUnit8Array = function(dataAsString) {
    var buff = new Buffer(dataAsString, 'base64');
    var key = new Uint8Array(buff.length);
    for (var i=0; i < buff.length; i++) {
      key[i] = buff.readUInt8(i);
    }
    return key;
  };

  var HandshakeKeys = {
    nonce: null,
    secretKey: null,
    publicKey: null,
    init: function() {
      try {
        var keyPair = sodium.crypto_box_keypair();
        this.publicKey = keyPair.publicKey;
        this.secretKey = keyPair.privateKey;
        this.nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
      } catch(e) {
        notifierCallback(new Error('Failed to initialise HandshakeKeys - libsodium error'));
      }
    }
  };

  var addToCallbackPool = function(data, callback) {
    var id = new Buffer(getValuesFromMap(sodium.crypto_hash(new Uint8Array(data)))).toString('base64');
    if (!callbackPool[id]) {
      callbackPool[id] = [];
    }
    callbackPool[id].push(callback);
  };

  var encrypt = function(data) {
    return getValuesFromMap(sodium.crypto_secretbox_easy(data, encryptionNonce, encryptionKey));
  };

  var decrypt = function(data) {
    var ct = new Uint8Array(data.length);
    for (var i=0; i < data.length; i++) {
      ct[i] = data.readUInt8(i);
    }
    var decryptedData = sodium.crypto_secretbox_open_easy(ct, encryptionNonce, encryptionKey);
    return new Buffer(getValuesFromMap(decryptedData)).toString();
  };

  var onDataReceived = function(data) {
    var response;
    try {
      response = JSON.parse(decrypt(data));
      log.verbose('Decrypted Response :' + JSON.stringify(response));
      if (!callbackPool.hasOwnProperty(response.id)) {
        log.warn('Callback not found for response in RequestManager');
        return;
      }
      log.verbose('Invoking Callbacks');
      var callbacks = callbackPool[response.id];
      for (var i in callbacks) {
        callbacks[i](response.error, response.data);
      }
      delete callbackPool[response.id];
    } catch(ex) {
      log.error(ex);
    }
  };

  var onConnectionError = function() {
    log.error('Launcher socket connection closed');
    notifierCallback('Launcher Connection Error');
  };

  var onHandShakeComplete = function(handshakeResponse) {
    log.info('Launcher responded for handshake request');
    log.verbose('Handshake response - ' + handshakeResponse.toString());
    handshakeResponse = JSON.parse(handshakeResponse.toString());
    if (handshakeResponse.error) {
      log.info('handshake failed - ' + handshakeResponse.error.description);
      log.warn(handshakeResponse.error);
      notifierCallback('Handshake failed - ' + handshakeResponse.error.description +
                      '(' + handshakeResponse.error.code + ')');
      return;
    }
    var launcherPublicKey = convertStringAsUnit8Array(handshakeResponse.data.launcher_public_key);
    var decryptedSymmKey;
    try {
      decryptedSymmKey = sodium.crypto_box_open_easy(convertStringAsUnit8Array(handshakeResponse.data.encrypted_symm_key), HandshakeKeys.nonce,
                                                     launcherPublicKey, HandshakeKeys.secretKey);
    } catch(e) {
      log.error('SymmetricKey Decryption failed');
      return notifierCallback('SymmetricKey Decryption failed');
    }

    encryptionNonce = decryptedSymmKey.subarray(0, sodium.crypto_secretbox_NONCEBYTES);
    encryptionKey = decryptedSymmKey.subarray(sodium.crypto_secretbox_NONCEBYTES);
    connectionManager.setOnDataRecievedListener(onDataReceived);
    notifierCallback(null, self);
  };

  var handshake = function() {
    log.info('Initiating Handshake with Launcher');
    var request = {
      "endpoint": "safe-api/v1.0/handshake/authenticate-app",
      "data": {
        "launcher_string": launcherString,
        "asymm_nonce": new Buffer(getValuesFromMap(HandshakeKeys.nonce)).toString('base64'),
        "asymm_pub_key": new Buffer(getValuesFromMap(HandshakeKeys.publicKey)).toString('base64')
      }
    };
    log.verbose('Sending Request : ' + JSON.stringify(request));
    connectionManager.send(JSON.stringify(request));
  };

  self.send = function(request, callback) {
    request = JSON.stringify(request);
    var encryptedRequest = encrypt(request);
    addToCallbackPool(getValuesFromMap(encryptedRequest), callback);
    connectionManager.send(new Buffer(encryptedRequest));
  };

  HandshakeKeys.init();
  log.verbose('Trying to connect with launcher');
  connectionManager.connect(host, portNumber, handshake, {
    'onData': onHandShakeComplete,
    'onError': onConnectionError
  });

  return;
};

exports = module.exports = RequestManager;
