var RequestManager = require('./request_manager');

var API = function () {
  var encryptionKey;
  var self = this;

  var notInitialisedYet = function() {
    console.log('Not yet initialised - init function should be invoked');
  };

  var onReady = function(callback) {
    
    this.updateAPI = function(err, requestManager) {
      if (err) {
        callback(err);
        return;
      }
      self.nfs = require('./nfs')(requestManager);
      self.dns = require('./dns')(requestManager);
      callback(null);
    };

    return this.updateAPI;
  };

  self.init = function(portNumber, launcherString, nonce, callback) {
     new RequestManager(portNumber, launcherString, nonce, onReady(callback));
  };

  self.nfs = notInitialisedYet;

  self.dns = notInitialisedYet;
};

exports = module.exports = new API();
