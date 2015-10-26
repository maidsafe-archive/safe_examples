/**
 * DNS Api
 * Interacts with Launcher IPC
*/
exports = module.exports = function(requestManager) {
  var log = require('npmlog');

  /**
   *
   * @param longName - public name (safe-express.com)
   * @param serviceName - service name or sub domain (www, blog, etc)
   * @param isSafeDrivePath - is the serviceHomeDirPath in the SAFEDrive, else the path would be searched in the application folder itself
   * @param serviceHomeDirPath - Path of the directory to be associated with the service
   * @param callback
   */
  this.registerDns = function(longName, serviceName, isSafeDrivePath, serviceHomeDirPath, callback) {
    if (!longName) {
      callback('longName cannot be empty');
      return;
    }
    if (!serviceHomeDirPath) {
      callback('serviceHomeDirPath cannot be empty');
      return;
    }
    var request = {
      endpoint: 'safe-api/v1.0/dns/register-dns',
      data: {
        long_name: longName,
        service_name: serviceName || 'www',
        is_path_shared: isSafeDrivePath || false,
        service_home_dir_path: serviceHomeDirPath
      }
    };
    log.verbose('Registering DNS :: ' +  longName);
    requestManager.send(request, callback);
  };

  return this;

};
