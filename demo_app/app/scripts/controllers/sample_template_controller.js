/**
 * Sample site controller
 */
window.maidsafeDemo.controller('SampleTemplateCtrl', [ '$scope', '$http', '$state', '$rootScope', 'safeApiFactory',
function($scope, $http, $state, $rootScope, safe) {
  'use strict';
  $scope.siteTitle = 'My Page';
  $scope.siteDesc = 'This page is created and published on the SAFE Network using the MaidSafe demo app';
  var filePath = '/views/sample_template_layout.html';
  var writeFile = function(title, content, filePath) {
    $rootScope.$loader.show();
    window.uiUtils.createTemplateFile(title, content, filePath, function(err, tempPath) {
      if (err) {
        return console.error(err);
      }
      var msg = null;
      var path = require('path');
      var serviceName = $state.params.serviceName;
      var uploader = new window.uiUtils.Uploader(safe);
      var progress = uploader.upload(tempPath, false, '/public/' + serviceName);
      progress.onUpdate = function() {
        if (!$rootScope.$loader.isLoading) {
          $rootScope.$loader.hide();
        }
        if (progress.total === (progress.completed + progress.failed)) {
          $rootScope.$loader.show();
          safe.addService(safe.getUserLongName(), serviceName, false, '/public/' + serviceName, function(err) {
            $rootScope.$loader.hide();
            if (err) {
              msg = err;
              return $rootScope.prompt.show('Publish Service Error', msg, function() {                
                $state.go('manageService');
              });
            }
            msg = 'Template has been published for the service: ' + serviceName;
            $rootScope.prompt.show('Service Published', msg, function() {              
              $state.go('manageService');
            });
          });
        }
      };
    });
  };

  $scope.registerProgress = function(progressScope) {
    $scope.progressIndicator = progressScope;
  };

  $scope.publish = function() {
    console.log($scope.siteTitle + ' ' + $scope.siteDesc);
    writeFile($scope.siteTitle, $scope.siteDesc, filePath);
  };

  $scope.handleInputClick = function(e) {
    e.stopPropagation();
    e.target.select();
  };
} ]);
