/**
 * Sample site controller
 */
window.maidsafeDemo.controller('SampleTemplateCtrl', [ '$scope', '$http', '$state',
'$rootScope', 'MESSAGES', 'safeApiFactory',
  function($scope, $http, $state, $rootScope, $msg, safe) {
    'use strict';
    $scope.siteTitle = 'My Page';
    $scope.siteDesc = 'This page is created and published on the SAFE Network using the SAFE demo app';
    $scope.longName = safe.getUserLongName();
    $scope.targetFolderName = $state.params.serviceName + '-service';
    var dirPath = 'views/sample_template';

    var onTemplateReady = function(err, tempPath) {
      $rootScope.$loader.hide();
      if (err) {
        console.error(err);
        return $rootScope.prompt.show('Upload Template', err);
      }
      var serviceName = $state.params.serviceName;
      var progressCallback = function(completed, total, status) {
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
        $rootScope.progressBar.update(Math.floor(progressCompletion), status);
        if (progressCompletion === 100) {
          return $state.go('managePublicData', {
            serviceName: $state.params.serviceName,
            remap: $state.params.remap,
            folderPath: 'public',
            servicePath: $scope.targetFolderName
          });
        }
      };
      var uploader = new window.uiUtils.Uploader(safe, progressCallback);
      uploader.setOnErrorCallback(function(msg) {
        $rootScope.$loader.hide();
        $rootScope.progressBar.close();
        $rootScope.prompt.show('Failed to Create Folder', msg);
      });
      if (!$scope.targetFolderName) {
        return $rootScope.prompt.show('Failed to Create Folder ', 'Folder name cannot be empty.', function() {});
      }
      uploader.upload(tempPath, false, '/public/' + $scope.targetFolderName);
    };

    var writeFile = function(title, content, dirPath) {
      $rootScope.$loader.show($msg.PREPARING_TEMPLATE);
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
