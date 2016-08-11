/**
 * @name safeLauncher
 * @description
 * SAFE launcher - gateway to the SAFE Network
 *
 * Main module of the application.
 */
window.maidsafeDemo = angular
  .module('maidsafeDemo', [ 'ui.router' ])
  .config([ '$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }
])
.run([ '$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$loader = {
    isLoading: false,
    description: null,
    show: function(description) {
      this.isLoading = true;
      this.description = description || '';
      $rootScope.$applyAsync();
    },
    hide: function() {
      this.isLoading = false;
      this.description = null;
      $rootScope.$applyAsync();
    }
  };
  $rootScope.openExternal = function(url) {
    require('shell').openExternal(url);
  };
  $rootScope.serviceList = [];
  $rootScope.isOnlyAlphaOrNumeric = function(str) {
    return (new RegExp(/^[a-z0-9]+$/g)).test(str);
  };
  $rootScope.$msPrompt = {
    isSet: false,
    msg: 'Confirmation content',
    title: 'Confirmation title',
    eventCallback: function() {
      this.hide();
    },
    callback: function(status) {},
    show: function(title, msg, callback) {
      this.isSet = true;
      this.title = title;
      this.msg = msg;
      this.evntCallback = callback;
    },
    hide: function() {
      this.isSet = false;
      this.msg = '';
    }
  };
  $rootScope.tempDirPath = require('temp').mkdirSync('safe-demo-');
} ]);
