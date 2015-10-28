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
    log.info('Data received from launcher (at RM) :' + data);
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

  var onConnectionError = function() {
    log.error('Launcher socket connection closed');
    notifierCallback('Launcher Connection Error');
  };

  var onHandShakeComplete = function(handshakeResponse) {
    log.info('Launcher responded for handshake request');

    var getAsKey = function(keyString) {
      var buff = new Buffer(keyString, 'base64');
      var key = new Uint8Array(buff.length);
      for (var i=0; i < buff.length; i++) {
        key[i] = buff.readUInt8(i);
      }
      return key;
    };

    log.verbose('Handshake response (Decrypted) - ' + handshakeResponse);
    if (handshakeResponse.error) {
      log.info('handshake failed - ' + handshakeResponse.error.description);
      log.warn(handshakeResponse.error);
      notifierCallback('Handshake failed - ' + handshakeResponse.error.description +
                      '(' + handshakeResponse.error.code + ')');
      return;
    }
    var launcherPublicKey = getAsKey(handshakeResponse.data.launcher_public_key);
    var decryptedSymmKey;
    try {
      decryptedSymmKey = sodium.crypto_box_open_easy(handshakeResponse.data.encrypted_symm_key, HandshakeKeys.nonce,
                                                     launcherPublicKey, HandshakeKeys.secretKey);
    } catch(e) {
      log.error('Err : SymmetricKey Decryption failed');
      return notifierCallback('SymmetricKey Decryption failed');
    }

    log.info('Symm ::' + decryptedSymmKey);
    //var symmKey = getAsKey(handshakeResponse.data.launcher_public_key);
    //encryptionNonce = handshakeResponse.data.splice(0, sodium.crypto_secretbox_NONCEBYTES);
    //encryptionKey = handshakeResponse.data;
    connectionManager.setOnDataRecievedListener(onDataReceived);
    notifierCallback(null, self);
  };

  var handshake = function() {
    log.info('Initiating Handshake');
    var request = {
      "endpoint": "safe-api/v1.0/handshake/authenticate-app",
      "data": {
        "launcher_string": launcherString,
        "asymm_nonce": new Buffer(getValuesFromMap(HandshakeKeys.nonce)).toString('base64'),
        "asymm_pub_key": new Buffer(getValuesFromMap(HandshakeKeys.publicKey)).toString('base64')
      }
    };
    log.verbose('Sending Request : ' + JSON.stringify(request));
    connectionManager.send(request);
  };

  self.send = function(request, callback) {
    log.verbose('Sending Request :' + request);
    request = encrypt(request);
    addToCallbackPool(request, callback);
    connectionManager.send(request);
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
