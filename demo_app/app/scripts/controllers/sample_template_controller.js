/**
 * Sample site controller
 */
window.maidsafeDemo.controller('SampleTemplateCtrl', [ '$scope', '$http', '$state', '$rootScope', 'safeApiFactory',
  function($scope, $http, $state, $rootScope, safe) {
    'use strict';
    $scope.siteTitle = 'My Page';
    $scope.siteDesc = 'This page is created and published on the SAFE Network using the MaidSafe demo app';
    var dirPath = 'views/sample_template';

    var onTemplateReady = function(err, tempPath) {
      if (err) {
        console.error(err);
        return $rootScope.prompt.show('Upload Template', err);
      }
      var serviceName = $state.params.serviceName;
      var progressCallback = function(completed, total) {
        if (!$rootScope.$loader.isLoading) {
          $rootScope.$loader.hide();
        }
        var progressCompletion = 100;
        if (!(total === 0 && completed === 0)) {
          progressCompletion = ((completed / total) * 100);
        }
        if (!$rootScope.progressBar.isDisplayed()) {
          $rootScope.progressBar.start('Uploading');
        }
        $rootScope.progressBar.update(Math.floor(progressCompletion));
        if (progressCompletion === 100) {
          $rootScope.$loader.show();
          $rootScope.prompt.show('Template Created', 'Sample temaplete created successfully!', function() {
            $state.go('managePublicData', {
              serviceName: $state.params.serviceName,
              remap: $state.params.remap
            });
          });
        }
      };
      var uploader = new window.uiUtils.Uploader(safe, progressCallback);
      uploader.setOnErrorCallback(function(msg) {
        $rootScope.$loader.hide();
        $rootScope.progressBar.close();
        $rootScope.prompt.show('Failed to upload Template', msg);
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

    $scope.createTeamplate = function() {
      console.log($scope.siteTitle + ' ' + $scope.siteDesc);
      writeFile($scope.siteTitle, $scope.siteDesc, dirPath);
    };

    $scope.handleInputClick = function(e) {
      e.stopPropagation();
      e.target.select();
    };
  }
]);
