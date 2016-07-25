/**
 * Router
 */
window.maidsafeDemo.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('authorise');
  $stateProvider
  .state('authorise', {
      url: '/authorise',
      templateUrl: 'views/authorisation.html'
    })
  .state('home', {
      url: '/home',
      templateUrl: 'views/home.html'
    })
  .state('manageNetworkData', {
      url: '/manage_network_data?:folderPath',
      templateUrl: 'views/manage_network_data.html'
    })
  .state('managePublicData', {
      url: '/manage_public_data?:serviceName&:servicePath?&:remap?&:folderPath',
      templateUrl: 'views/manage_public_data.html'
    })
  .state('publicID', {
      url: '/manage_public_id',
      templateUrl: 'views/manage_public_id.html'
    })
  .state('manageService', {
      url: '/manage_service?:longName?',
      templateUrl: 'views/manage_service.html'
    })
  .state('createService', {
      url: '/create_service?:serviceName?',
      templateUrl: 'views/create_service.html'
    })
  .state('sampleTemplate', {
      url: '/sample_template?:serviceName?:remap?',
      templateUrl: 'views/sample_template.html'
    })
  .state('serviceExplorer', {
      url: '/service_explorer?:serviceName&:servicePath?',
      templateUrl: 'views/service_explorer.html'
    });
});
