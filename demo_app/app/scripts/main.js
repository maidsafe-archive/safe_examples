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
} ]);
