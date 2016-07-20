/**
 * Manage private data controller
 */
window.maidsafeDemo.controller('PrivateDataCtrl', [ '$rootScope', '$scope', '$state', 'safeApiFactory',
  function($rootScope, $scope, $state, safe) {
    'use strict';
    $scope.selectedFolder = null;
    var onServiceCreated = function(err) {
      var goToManageService = function() {
        $state.go('manageService');
      };
      $rootScope.$loader.hide();
      if (err) {
        return $rootScope.prompt.show('Publish Service Error', 'Failed to add new service\n', function() {}, {
          title: 'Reason',
          ctx: err.data.description
        });
      }
      var msg = 'Service ' + $state.params.serviceName + ' published';
      $rootScope.prompt.show('Service Published', msg, goToManageService);
    };
    $scope.setTargetFolder = function(name) {
      if (name) {
        return $scope.selectedFolder = name;
      }
      $scope.selectedFolder = null;
    };

    $scope.onProgress = function(percentage, isUpload) {
      if (!$rootScope.progressBar.isDisplayed()) {
        $rootScope.progressBar.start(isUpload ? 'Uploading' : 'Downloading');
      }
      $rootScope.progressBar.update(Math.floor(percentage));
    };

    $scope.mapService = function() {
      if (!$state.params.serviceName) {
        return;
      }
      var serviceName = $state.params.serviceName;
      $rootScope.$loader.hide();
      safe.addService(safe.getUserLongName(), serviceName, false, $scope.selectedFolder, onServiceCreated);
    };
  }
]);
