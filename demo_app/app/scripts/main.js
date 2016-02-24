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
    show: function() {
      this.isLoading = true;
      $rootScope.$applyAsync();
    },
    hide: function() {
      this.isLoading = false;
      $rootScope.$applyAsync();
    }
  };
  $rootScope.$msPrompt = {
    isSet: false,
    msg: 'Confirmation content',
    title: 'Confirmation title',
    callback: function(status) {},
    show: function(title, msg, callback) {
      this.isSet = true;
      this.title = title;
      this.msg = msg;
      this.callback = callback;
    },
    hide: function() {
      this.isSet = false;
      this.msg = '';
    }
  };
} ]);
