/**
 * Sample site controller
 */
window.maidsafeDemo.controller('SampleTemplateCtrl', [ '$scope', '$http', '$state', '$rootScope', 'safeApiFactory',
  function($scope, $http, $state, $rootScope, safe) {
    'use strict';
    $scope.siteTitle = 'My Page';
    $scope.siteDesc = 'This page is created and published on the SAFE Network using the MaidSafe demo app';
    var dirPath = 'views/sample_template';

    var onServiceCreated = function(err) {
      var goToManageService = function() {
        $state.go('manageService');
      };
      $rootScope.$loader.hide();
      if (err) {
        return $rootScope.prompt.show('Publish Service Error', err, goToManageService);
      }
      var msg = 'Template has been published for the service: ' + $state.params.serviceName;
      $rootScope.prompt.show('Service Published', msg, goToManageService);
    };

    var onTemplateReady = function(err, tempPath) {
      if (err) {
        return console.error(err);
      }
      var serviceName = $state.params.serviceName;
      var progressCallback = function(completed, total) {
        if (!$rootScope.$loader.isLoading) {
          $rootScope.$loader.hide();
        }
        if (total === completed) {
          $rootScope.$loader.show();
          safe.addService(safe.getUserLongName(), serviceName, false, '/public/' + serviceName, onServiceCreated);
        }
      };
      var uploader = new window.uiUtils.Uploader(safe, progressCallback);
      uploader.setOnErrorCallback(function(msg) {
        $rootScope.$loader.hide();
        $rootScope.prompt.show('Filed to upload Template', msg);
      });
      uploader.upload(tempPath, false, '/public/' + serviceName);
    };

    var writeFile = function(title, content, dirPath) {
      $rootScope.$loader.show();
      window.uiUtils.createTemplateFile(title, content, dirPath, onTemplateReady);
    };

    $scope.registerProgress = function(progressScope) {
      $scope.progressIndicator = progressScope;
    };

    $scope.publish = function() {
      console.log($scope.siteTitle + ' ' + $scope.siteDesc);
      writeFile($scope.siteTitle, $scope.siteDesc, dirPath);
    };

    $scope.handleInputClick = function(e) {
      e.stopPropagation();
      e.target.select();
    };
  }
]);
