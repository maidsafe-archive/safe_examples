/**
 * DNS factory
 */
window.maidsafeDemo.factory('dnsFactory', [ function(Shared) {
  'use strict';
  var self = this;

  self.createPublicId = function(longName, callback) {
    var payload = {
      url: this.SERVER + 'dns/' + longName,
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      }
    };
    (new this.Request(payload, callback)).send();
  };

  // get dns list
  self.getDns = function(callback) {
    var payload = {
      url: this.SERVER + 'dns',
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      }
    };
    (new this.Request(payload, callback)).send();
  };

  // get service
  self.getServices = function(longName, callback) {
    var payload = {
      url: this.SERVER + 'dns/' + longName,
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      }
    };
    (new this.Request(payload, callback)).send();
  };

  // add service
  self.addService = function(longName, serviceName, isPathShared, serviceHomeDirPath, callback) {
    var payload = {
      url: this.SERVER + 'dns',
      method: 'PUT',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      },
      data: {
        longName: longName,
        serviceName: serviceName,
        isPathShared: isPathShared,
        serviceHomeDirPath: serviceHomeDirPath
      }
    };
    (new this.Request(payload, callback)).send();
  };

  self.deleteService = function(longName, serviceName, callback) {
    var payload = {
      url: this.SERVER + 'dns/' + serviceName + '/' + longName,
      method: 'DELETE',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      }
    };
    (new this.Request(payload, callback)).send();
  };

  self.getHomeDir = function(longName, serviceName, callback) {
    var payload = {
      url: this.SERVER + 'dns/' + serviceName + '/' + longName,
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      }
    };
    (new this.Request(payload, callback)).send();
  };
  return self;
} ]);
