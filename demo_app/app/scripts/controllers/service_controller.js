/**
 * Service controller
 */
window.maidsafeDemo.controller('ServiceCtrl', [ '$scope', '$state', '$rootScope', '$timeout', 'safeApiFactory',
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
        res.forEach(function(longName, index) {
          safe.getServices(longName, function(err, services) {
            if (err) {
              $rootScope.$loader.hide();
              return console.error(err);
            }
            services = JSON.parse(services);
            if (services.length === 0) {
              $rootScope.$loader.hide();
              return console.log('No service registered for ' + longName);
            }
            addServices(longName, services);
            if (index === (res.length - 1)) {
              $rootScope.$loader.hide();
            }
          });
        });
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
      if (!$rootScope.isOnlyAlphaOrNumeric($scope.serviceName)) {
        return $rootScope.prompt.show('Invalid input',
          'Service name should not contain special characters, Uppercase or space',
          function() {
            $scope.serviceName = '';
            $scope.$applyAsync();
          });
      }
      $state.go('serviceAddFiles', {
        'serviceName': $scope.serviceName
      });
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
        properties: [ 'openDirectory' ]
      }, function(folders) {
        if (folders.length === 0) {
          return;
        }
        $rootScope.$loader.show();
        var serviceName = $state.params.serviceName;
        try {
          var progressCallback = function(completed, total, filePath) {
            if ($rootScope.$loader.isLoading) {
              $rootScope.$loader.hide();
            }
            var progressCompletion = 100;
            if (!(total === 0 && completed === 0)) {
              progressCompletion = ((completed / total) * 100);
            }
            $scope.onProgress(progressCompletion, true);
            if (progressCompletion >= 100) {
              registerService();
            }
          };
          var uploader = new window.uiUtils.Uploader(safe, progressCallback);
          uploader.setOnErrorCallback(function(msg) {
              $scope.onProgress(100, false);
              $rootScope.prompt.show('Upload failed', msg);
            });
          uploader.upload(folders[0], false, '/public/' + serviceName);
        } catch (e) {
          console.error(e);
          $rootScope.$loader.hide();
          $rootScope.prompt.show('File Size Restriction', e.message);
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
