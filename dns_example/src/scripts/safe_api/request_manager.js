/**
 * Manages the request and maps the responses back to the callbacks.
 * Request manager on initialisation sends back its own instance as the success parameter of notifierCallback.
 * Any IO error (Socket connection) with launcher is also indicated via the error parameter of notifierCallback.
 * @param host - Host ip recieved from launcher
 * @param portNumber - portNumber received from launcher
 * @param launcherString - String received from launcher
 * @param notifierCallback - Invoked on successful initialisation or on IO error
 * @constructor
 */
var RequestManager = function(host, portNumber, launcherString, notifierCallback) {
  var connectionManager = require('./connection_manager');
  var sodium = require('libsodium-wrappers');
  var log = require('npmlog');

  var encryptionKey;
  var encryptionNonce;
  var self = this;
  var callbackPool = {};

  /**
   * Utility function to extract values from a map data structure.
   * Libsodium results are mostly map data structure.
   * @param map
   * @returns {Array}
   */
  var getValuesFromMap = function(map) {
    var values = [];
    for (var k in map) {
      values.push(map[k]);
    }
    return values;
  };

  /**
   * Utility function to convert base64 string into a Unit8Array
   * @param dataAsString - base64 string
   * @returns {Uint8Array}
   */
  var convertStringAsUnit8Array = function(dataAsString) {
    var buff = new Buffer(dataAsString, 'base64');
    var key = new Uint8Array(buff.length);
    for (var i=0; i < buff.length; i++) {
      key[i] = buff.readUInt8(i);
    }
    return key;
  };

  /**
   * Holder for managing the Keys used during the Handshake with launcher
   * @type {{nonce: null, secretKey: null, publicKey: null, init: Function}}
   */
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

  /**
   * Data is hashed (SHA512) and converted as a base64 string.
   * The base64 string serves as ID for identifying the response and associating with their callbacks.
   * Callbacks are added to an Array, to manage multiple requests.
   * @param data
   * @param callback
   */
  var addToCallbackPool = function(data, callback) {
    var id = new Buffer(getValuesFromMap(sodium.crypto_hash(new Uint8Array(data)))).toString('base64');
    if (!callbackPool[id]) {
      callbackPool[id] = [];
    }
    callbackPool[id].push(callback);
  };

  /**
   * Encrypts the data with the Symmetric Key and nonce received from the launcher
   * @param data
   * @returns {Array}
   */
  var encrypt = function(data) {
    return getValuesFromMap(sodium.crypto_secretbox_easy(data, encryptionNonce, encryptionKey));
  };

  /**
   * Decrypts the data with the Symmetric Key and nonce received from the launcher
   * @param data
   * @returns {String}
   */
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
      log.info('Decrypted Response :' + JSON.stringify(response));
      if (!callbackPool.hasOwnProperty(response.id)) {
        log.warn('Callback not found for response in RequestManager');
        return;
      }
      log.verbose('Invoking Callbacks');
      var callbacks = callbackPool[response.id];
      for (var i in callbacks) {
        var error = (response.error.code === 0) ? null : response.error;
        callbacks[i](error, response.data);
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

  /**
   * Invoked after the Handshake response is recieved from the launcher.
   * The response is parsed and the result is notified via the notifierCallback.
   * if the response received is success, then the Symmetric key and nonce is decrypted from the response.
   * @param handshakeResponse
   */
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

  /**
   * Instantiates the Handshake request
   */
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

  /**
   * Invoked to send the Request to the Launcher
   * @param request - Object
   * @param callback
   */
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
