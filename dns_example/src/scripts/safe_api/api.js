var RequestManager = require('./request_manager');
var log = require('npmlog');

var API = function () {
  var self = this;

  var notInitialisedYet = function() {
    log.warn('Not yet initialised - init function should be invoked');
  };

  var onReady = function(callback) {
    this.updateAPI = function(err, requestManager) {
      if (err) {
        log.error('Failed to connect with launcher ' + err);
        return callback(err);
      }
      log.info('Connected with Launcher');
      self.nfs = require('./nfs')(requestManager);
      self.dns = require('./dns')(requestManager);
      log.verbose('SAFE API functions has been initialised');
      callback(null);
    };

    return this.updateAPI;
  };

  /**
   * The API gets initialised after successful handshake with the launcher.
   * @param host - host ip from launcher
   * @param portNumber - port number from launcher
   * @param launcherString - string
   * @param listener - Launcher connectivity (Ready/Error)is intimated through the listener
   */
  self.init = function(host, portNumber, launcherString, listener) {
     new RequestManager(host, portNumber, launcherString, onReady(listener));
  };

  self.nfs = notInitialisedYet;

  self.dns = notInitialisedYet;

  return self;
};

exports = module.exports = new API();
