/**
 * SAFE Api factory
 */
window.maidsafeDemo.factory('safeApiFactory', [ '$http', '$q', '$rootScope', 'nfsFactory', 'dnsFactory',
function(http, $q, $rootScope, nfs, dns) {
  'use strict';
  var self = this;
  var TOKEN_KEY = 'MaidSafeDemoAppToken';
  var LONG_NAME_KEY = 'MaidSafeDemoAppLongName';
  self.SERVER = 'http://localhost:8100/';
  self.dnsList = null;

  var setAuthToken = function(token) {
    localStorage.setItem(TOKEN_KEY, token);
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

  self.Request = function(payload, callback, allowUnAuthErr) {
    var checkLauncherStatus = function(cb) {
      var getTokenPayload = {
        url: self.SERVER + '/auth',
        method: 'GET',
        headers: {
          authorization: 'Bearer ' + self.getAuthToken()
        }
      };
      http(getTokenPayload).then(function(res) {
        cb(null, res);
      }, function(err) {
        cb(err);
      });
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
      callback(null, response.data, response.headers);
    };
    var onError = function(err) {
      if (err.status === -1) {
        checkLauncherStatus(function(error, response) {
          if (error && error.status === -1) {
            return closeApp('Could not connect to launcher',
              'Failed to connect with launcher. Launcher should be left running.');
          }
          // TODO check other error throwing status -1
          return callback(err);
        });
      }
      if (err.status === 401 && allowUnAuthErr) {
        return callback(err);
      }
      if (err.status === 401) {
        return closeApp('Access denied', 'Launcher has denied access. Restart application again to continue.');
      }
      return callback(err);
    };
    this.send = function() {
      http(payload).then(onSuccess, onError);
    };
    return this;
  };

  var sendAuthorisationRequest = function(callback) {
    var onResponse = function(err, body, headers) {
      if (!err && !body && !headers) {
        return callback('Unable to connect Launcher');
      }
      if (err) {
        return callback(err);
      }
      var symmetricKeys = {
        key: null,
        nonce: null
      };
      setAuthToken(body.token);
      callback(null, body.data);
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
        permissions: []
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
