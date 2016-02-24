/**
 * Service controller
 */
window.maidsafeDemo.controller('ServiceCtrl', [ '$scope', '$state', '$rootScope', 'safeApiFactory',
function($scope, $state, $rootScope, safe) {
  'use strict';
  $scope.serviceList = [];
  $scope.newService = null;
  $scope.newServicePath = '/public';
  $scope.progressIndicator = null;

  $scope.longName = safe.getUserLongName();

  // get services
  $scope.getServices = function() {
    $rootScope.$loader.show();
    safe.getDns(function(err, res) {
      $rootScope.$loader.hide();
      if (err) {
        return console.error(err);
      }
      res = JSON.parse(res);
      if (res.length === 0) {
        return console.log('No Public ID registered');
      }
      var addServices = function(longName, services) {
        services.forEach(function(ser) {
          $scope.serviceList.push({
            longName: longName,
            name: ser
          });
        });
      };
      $rootScope.$loader.show();
      res.forEach(function(longName) {
        safe.getServices(longName, function(err, services) {
          if (err) {
            return console.error(err);
          }
          services = JSON.parse(services);
          if (services.length === 0) {
            return console.log('No service registered for ' + longName);
          }
          addServices(longName, services);
        });
      });
      $rootScope.$loader.hide();
      console.log(res);
    });
  };

  // create service
  $scope.createService = function() {
    if (!$scope.longName) {
      return console.error('Create your Public ID to register a service');
    }
    if (!$scope.serviceName) {
      return console.error('Provide valid service name');
    }
    $state.go('serviceAddFiles', { 'serviceName': $scope.serviceName });
    $scope.serviceName = '';
  };

  // explorer init
  $scope.explorerInit = function() {
    $scope.newService = $state.params.serviceName + '.' + $scope.longName + '.safenet';
  };

  // set target folder
  $scope.setTargetFolder = function(name) {
    $scope.newServicePath = name;
  };

  $scope.publishService = function() {
    safe.addService($scope.longName, $state.params.serviceName, false, $scope.newServicePath, function(err, res) {
      var msg = null;
      if (err) {
        msg = err;
        return $rootScope.$msPrompt.show('Publish Service Error', msg, function(status) {
          $rootScope.$msPrompt.hide();
          $state.go('manageService');
        });
      }
      msg = $state.params.serviceName + ' service has been published successfully';
      $rootScope.$msPrompt.show('Service Published', msg, function(status) {
        $rootScope.$msPrompt.hide();
        $state.go('manageService');
      });
    });
  };

  $scope.registerProgress = function(progressScope) {
    $scope.progressIndicator = progressScope;
  };

  $scope.uploadDirectoryForService = function() {
    var dialog = require('remote').dialog;
    dialog.showOpenDialog({
      title: 'Select Directory for upload',
      properties: [ 'openDirectory' ]
    }, function(folders) {
      if (folders.length === 0) {
        return;
      }
      $rootScope.$loader.show();
      var serviceName = $state.params.serviceName;
      // TODO instead of binding uploader to window use require
      var uploader = new window.uiUtils.Uploader(safe);
      var progress = uploader.upload(folders[0], false, '/public/' + serviceName);
      progress.onUpdate = function() {
        if ($rootScope.$loader.isLoading) {
          $rootScope.$loader.hide();
        }
        var progressCompletion = (((progress.completed + progress.failed) / progress.total) * 100);
        if (progressCompletion === 100) {
          $rootScope.$loader.show();
          safe.addService($scope.longName, serviceName, false, '/public/' + serviceName, function(err) {
            $rootScope.$loader.hide();
            var msg = null;
            if (err) {
              console.error(err);
              msg = 'Service could not be created';
              return $rootScope.$msPrompt.show('Publish Service Error', msg, function(status) {
                $rootScope.$msPrompt.hide();
                return $state.go('manageService');
              });
            }
            msg = $state.params.serviceName + ' service has been published successfully';
            $rootScope.$msPrompt.show('Service Published', msg, function(status) {
              $rootScope.$msPrompt.hide();
              $state.go('manageService');
            });
          });
        }
        $scope.onUpload(progressCompletion);
      };
    });
  };

  $scope.onUpload = function(percentage) {
    if (percentage < 100 && !$scope.progressIndicator.show) {
      $scope.progressIndicator.show = true;
    }
    if (percentage === 100) {
      $scope.progressIndicator.show = false;
    }
    $scope.progressIndicator.percentage = Math.floor(percentage);
    console.log(percentage);
  };
} ]);
