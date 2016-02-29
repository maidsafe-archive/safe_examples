/**
 * Service controller
 */
window.maidsafeDemo.controller('ServiceCtrl', ['$scope', '$state', '$rootScope', '$timeout', 'safeApiFactory',
  function($scope, $state, $rootScope, $timeout, safe) {
    'use strict';
    $scope.serviceName = '';
    $scope.serviceList = [];
    $scope.newService = null;
    $scope.newServicePath = '/public';

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
          services.forEach(function(serviceName) {
            $scope.serviceList.push({
              longName: longName,
              name: serviceName
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
      if (!safe.isAlphaNumeric($scope.serviceName)) {
        return $rootScope.prompt.show('Invalid data', 'Service name should not contain special characters, Uppercase or space', function() {
          $scope.serviceName = '';
          $scope.$applyAsync();
        });
      }
      $state.go('serviceAddFiles', { 'serviceName': $scope.serviceName });
      $scope.serviceName = '';
    };

    // explorer init
    $scope.explorerInit = function() {
      $scope.newService = $state.params.serviceName + '.' + $scope.longName + '.safenet';
    };

    $scope.publishService = function() {
      safe.addService($scope.longName, $state.params.serviceName, false, $scope.newServicePath, function(err, res) {
        var msg = null;
        if (err) {
          msg = err;
          return $rootScope.prompt.show('Publish Service Error', msg, function() {
            $state.go('manageService');
          });
        }
        msg = $state.params.serviceName + ' service has been published successfully';
        $rootScope.prompt.show('Service Published', msg, function() {
          $state.go('manageService');
        });
      });
    };

    var registerService = function() {
      $rootScope.$loader.show();
      var serviceName = $state.params.serviceName;
      var onResponse = function(err) {
        $rootScope.$loader.hide();
        var msg = null;
        if (err) {
          console.error(err);
          msg = 'Service could not be created';
          return $rootScope.prompt.show('Publish Service Error', msg, function() {
            return $state.go('manageService');
          });
        }
        msg = serviceName + ' service has been published successfully';
        $rootScope.prompt.show('Service Published', msg, function() {
          $state.go('manageService');
        });
      };
      safe.addService($scope.longName, serviceName, false, '/public/' + serviceName, onResponse);
    };

    $scope.uploadDirectoryForService = function() {
      var dialog = require('remote').dialog;
      dialog.showOpenDialog({
        title: 'Select Directory for upload',
        properties: ['openDirectory']
      }, function(folders) {
        if (folders.length === 0) {
          return;
        }
        $rootScope.$loader.show();
        var serviceName = $state.params.serviceName;
        try {
          var uploader = new window.uiUtils.Uploader(safe);
          var progress = uploader.upload(folders[0], false, '/public/' + serviceName);
          progress.onUpdate = function() {
            if ($rootScope.$loader.isLoading) {
              $rootScope.$loader.hide();
            }
            var progressCompletion = (((progress.completed + progress.failed) / progress.total) * 100);
            if (progressCompletion === 100) {
              registerService();
            }
            $scope.onProgress(progressCompletion, true);
          };
        } catch (e) {
          $rootScope.$loader.hide();
          $rootScope.prompt.show('MaidSafe Demo', 'Cannot upload file more than 1 Mb')
        }

      });
    };

    $scope.openLink = function(serviceName, publicName) {
      var shell = require('remote').shell;
      shell.openExternal('http://' + serviceName + '.' + publicName + '.safenet');
    };

    $scope.onProgress = function(percentage, isUpload) {
      if (!$rootScope.progressBar.isDisplayed()) {
        $rootScope.progressBar.start(isUpload ? 'Uploading' : 'Downloading');
      }
      $rootScope.progressBar.update(Math.floor(percentage));
    };
  }
]);
