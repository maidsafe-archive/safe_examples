/**
 * SAFE Api factory
 */
window.maidsafeDemo.factory('safeApiFactory', [ '$http', '$q', '$rootScope', 'nfsFactory', 'dnsFactory',
function(http, $q, $rootScope, nfs, dns) {
  'use strict';
  var self = this;
  var sodium = require('libsodium-wrappers');
  var TOKEN_KEY = 'MaidSafeDemoAppToken';
  var LONG_NAME_KEY = 'MaidSafeDemoAppLongName';
  var SYMMETRIC_KEY = 'MaidSafeDemoAppSymmetricKeys';
  self.SERVER = 'http://localhost:8100/';
  self.authToken = null;
  self.dnsList = null;

  var setAuthToken = function(token) {
    localStorage.setItem(TOKEN_KEY, token);
  };

  var setSymmetricKeys = function(symmetricKeys) {
    localStorage.setItem(SYMMETRIC_KEY, JSON.stringify(symmetricKeys));
  };

  self.getAuthToken = function() {
    return localStorage.getItem(TOKEN_KEY);
  };

  self.setUserLongName = function(longName) {
    localStorage.setItem(LONG_NAME_KEY, longName);
  };

  self.getUserLongName = function() {
    return localStorage.getItem(LONG_NAME_KEY);
  };

  self.getSymmetricKeys = function() {
    var symmetricKeys = JSON.parse(localStorage.getItem(SYMMETRIC_KEY));
    symmetricKeys.key = new Uint8Array(new Buffer(symmetricKeys.key, 'base64'));
    symmetricKeys.nonce = new Uint8Array(new Buffer(symmetricKeys.nonce, 'base64'));
    return symmetricKeys;
  };

  self.Request = function(payload, callback, allowUnAuthErr) {
    var encrypt = function() {
      if (!(payload.headers && payload.headers.authorization)) {
        return payload;
      }
      payload.headers['Content-Type'] = 'text/plain';
      try {
        var symmetricKeys = self.getSymmetricKeys();
        // TODO query params decryption
        var query = payload.url.split('?');
        if (query[1]) {
          /*jscs:disable requireCamelCaseOrUpperCaseIdentifiers*/
          var encryptedQuery = new Buffer(sodium.crypto_secretbox_easy(query[1],
            symmetricKeys.nonce, symmetricKeys.key)).toString('base64');
          /*jscs:enable requireCamelCaseOrUpperCaseIdentifiers*/
          payload.url = query[0] + '?' + encodeURIComponent(encryptedQuery);
        }
        if (payload.data) {
          var data = payload.data;
          if (!(data instanceof Uint8Array)) {
            data = new Uint8Array(new Buffer(JSON.stringify(data)));
          }
          /*jscs:disable requireCamelCaseOrUpperCaseIdentifiers*/
          payload.data = new Buffer(sodium.crypto_secretbox_easy(data,
            symmetricKeys.nonce, symmetricKeys.key)).toString('base64');
          /*jscs:enable requireCamelCaseOrUpperCaseIdentifiers*/
        }
        return payload;
      } catch (e) {
        return callback(e);
      }
    };
    var decrypt = function(response) {
      var data = response.data;
      if (!data) {
        return callback('Invalid data');
      }
      if (!(payload.headers && payload.headers.authorization)) {
        return data;
      }
      try {
        var symmetricKeys = self.getSymmetricKeys();
        try {
          /*jscs:disable requireCamelCaseOrUpperCaseIdentifiers*/
          data = sodium.crypto_secretbox_open_easy(new Uint8Array(new Buffer(data, 'base64')),
            symmetricKeys.nonce, symmetricKeys.key);
          /*jscs:enable requireCamelCaseOrUpperCaseIdentifiers*/
          data = response.headers('file-name') ? new Buffer(data) : new Buffer(data).toString();
        } catch (e) {}
        return data;
      } catch (e) {
        return callback(e);
      }
    };
    var closeApp = function(title, msg) {
      $rootScope.$loader.hide();
      $rootScope.prompt.show(title, msg, function() {
        window.uiUtils.closeApp();
      });
      return;
    };
    var onSuccess = function(response) {
      if (!response) {
        return callback();
      }
      callback(null, decrypt(response), response.headers);
    };
    var onError = function(err) {
      if (err.status === -1) {
        return closeApp('Could not connect to launcher',
          'Failed to connect with launcher. Launcher should be left running.');
      }
      if (err.status === 401 && allowUnAuthErr) {
        return callback(err);
      }
      if (err.status === 401) {
        return closeApp('Access denied', 'Launcher has denied access. Restart application again to continue.');
      }
      err = decrypt(err);
      return callback(err);
    };
    this.send = function() {
      http(encrypt(payload)).then(onSuccess, onError);
    };
    return this;
  };

  var sendAuthorisationRequest = function(callback) {
    /*jscs:disable requireCamelCaseOrUpperCaseIdentifiers*/
    var assymKeys = sodium.crypto_box_keypair();
    var assymNonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    /*jscs:enable requireCamelCaseOrUpperCaseIdentifiers*/
    var publicKey = new Buffer(assymKeys.publicKey).toString('base64');
    var nonce = new Buffer(assymNonce).toString('base64');

    var onResponse = function(err, body, headers) {
      if (!err && !body && !headers) {
        return callback('Unable to connect Launcher');
      }
      if (err) {
        return callback(err);
      }
      // self.authToken = body.token;
      var symmetricKeys = {
        key: null,
        nonce: null
      };
      setAuthToken(body.token);
      var cipher = new Uint8Array(new Buffer(body.encryptedKey, 'base64'));
      var publicKey = new Uint8Array(new Buffer(body.publicKey, 'base64'));
      /*jscs:disable requireCamelCaseOrUpperCaseIdentifiers*/
      var data = sodium.crypto_box_open_easy(cipher, assymNonce, publicKey, assymKeys.privateKey);
      symmetricKeys.key = data.slice(0, sodium.crypto_secretbox_KEYBYTES);
      symmetricKeys.nonce = data.slice(sodium.crypto_secretbox_KEYBYTES);
      /*jscs:enable requireCamelCaseOrUpperCaseIdentifiers*/
      symmetricKeys.key = new Buffer(symmetricKeys.key).toString('base64');
      symmetricKeys.nonce = new Buffer(symmetricKeys.nonce).toString('base64');
      setSymmetricKeys(symmetricKeys);
      callback(null, symmetricKeys);
    };

    var packageData = require('./package.json');
    var payload = {
      url: self.SERVER + 'auth',
      method: 'POST',
      data: {
        app: {
          name: packageData.productName,
          id: packageData.identifier,
          version: packageData.version,
          vendor: packageData.author
        },
        permissions: [],
        publicKey: publicKey,
        nonce: nonce
      }
    };
    (new self.Request(payload, onResponse)).send();
  };

  var isTokenValid = function(callback) {
    var token = self.getAuthToken();
    if (!token) {
      return callback('No token found');
    }
    var payload = {
      url: self.SERVER + 'auth',
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + token
      }
    };
    (new self.Request(payload, callback, true)).send();
  };

  // authorise application
  self.authorise = function(callback) {
    isTokenValid(function(err) {
      if (err) {
        localStorage.clear();
        return sendAuthorisationRequest(callback);
      }
      return callback();
    });
  };

  return $.extend(self, nfs, dns);
} ]);
