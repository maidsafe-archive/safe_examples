var requestManager = require('./request_manager');
var connectionManager = require('./connection_manager');

var API = function () {
  var encryptionKey;
  var self = this;

  self.init = function(portNumber, launcherString, nonce, callback) {
    // connectionManager.startListening();
    // Handle Handlshake - MAID 1464
    // initialise requestManager
    // on success {
    //    set Encryption key & set the NFS and DNS API
    //    self.nfs = require('./nfs')(requestManager);
    //    self.dns = require('./dns')(requestManager);
    // }
    // pass result to callback
  };

  self.nfs = function() {
    console.log('Not yet initialised - init function should be invoked');
  };

  self.dns = function() {
    console.log('Not yet initialised - init function should be invoked');
  };

};
