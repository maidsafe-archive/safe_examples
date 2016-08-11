/**
 * Service controller
 */
window.maidsafeDemo.controller('ServiceCtrl', [ '$scope', '$state', '$rootScope',
'$timeout', 'MESSAGES', 'safeApiFactory',
  function($scope, $state, $rootScope, $timeout, $msg, safe) {
    'use strict';
    $scope.serviceName = '';
    // $scope.serviceList = [];
    $scope.newService = null;
    $scope.newServicePath = '/public';

    $scope.longName = safe.getUserLongName();
    var serviceCheck = /^[a-z0-9][a-z0-9-]{1,60}[a-z0-9](?:)+$/;

    // get services
    $scope.getServices = function() {
      $rootScope.serviceList = [];
      var addServices = function(longName, serviceName, homeDir) {
        $rootScope.serviceList.push({
          longName: longName,
          name: serviceName,
          homeDir: homeDir
        });
      };

      var getHomeDir = function(longName, serviceList) {
        $rootScope.$loader.show($msg.MAP_SERVICE_WITH_HOME_DIR);
        serviceList.forEach(function(service, index) {
          safe.getHomeDir(longName, service, function(err, homeDir) {
            if (err) {
              console.error(err);
              $rootScope.$loader.hide();
              return $rootScope.prompt.show('Get Services', 'Failed to map service to \'HOME DIRECTORY\'',
              function() {}, {
                title: 'Reason',
                ctx: err.data.description
              });
            }
            if (index === (serviceList.length - 1)) {
              $rootScope.$loader.hide();
            }
            addServices(longName, service, homeDir.info.name);
          });
        });
      };

      var getServicesForLongname = function(longName) {
        var getServicesCallback = function(err, services) {
          $rootScope.$loader.hide();
          if (err) {
            console.error(err);
            return $rootScope.prompt.show('Get Services', 'Failed to get service list', function() {}, {
              title: 'Reason',
              ctx: err.data.description
            });
          }
          if (services.length === 0) {
            return console.log('No service registered for ' + longName);
          }
          getHomeDir(longName, services);
        };
        safe.getServices(longName, getServicesCallback);
      };

      $rootScope.$loader.show($msg.GET_SERVICE_LIST);
      getServicesForLongname($scope.longName);
    };

    // create service
    $scope.createService = function() {
      if (!$scope.longName) {
        return console.error('Create your Public ID to register a service');
      }
      if (!$scope.serviceName) {
        return console.error('Provide valid service name');
      }
      if (!serviceCheck.test($scope.serviceName)) {
        return $rootScope.prompt.show('Invalid input',
          'Service name should be minimum of 3 characters and maximum of 63 characters. Should be lower case and ' +
          'should not contain special characters or space. In addition \'-\' is permitted if it is not at the ' +
          'start or end',
          function() {
            $scope.serviceName = '';
            $scope.$applyAsync();
          });
      }
      var serviceNames = $rootScope.serviceList.map(function(service) {
        return service.name;
      });
      if (serviceNames.indexOf($scope.serviceName) !== -1) {
        return $rootScope.prompt.show('Service Name Exists', ($scope.serviceName + ' service already exists.'),
          function() {
            $scope.serviceName = '';
            $scope.$applyAsync();
          });
      }
      $state.go('managePublicData', {
        'serviceName': $scope.serviceName.toLowerCase(),
        'folderPath': 'public'
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
          return $rootScope.prompt.show('Publish Service Error', 'Failed to add service', function() {
            $state.go('manageService');
          }, {
            title: 'Reason',
            ctx: err.data.description
          });
        }
        msg = $state.params.serviceName + ' service has been published successfully';
        $rootScope.prompt.show('Service Published', msg, function() {
          $state.go('manageService');
        });
      });
    };

    $scope.deleteService = function(serviceName) {
      if (!serviceName) {
        return;
      }
      $rootScope.$loader.show($msg.DELETING_SERVICE);
      safe.deleteService($scope.longName, serviceName, function(err, res) {
        $rootScope.$loader.hide();
        if (err) {
          return $rootScope.prompt.show('Delete Service Error', 'Failed to delete service', function() {
            $state.go('manageService');
          }, {
            title: 'Reason',
            ctx: err.data.description
          });
        }
        $rootScope.prompt.show('Service Deleted', 'Service deleted successfully!', function() {
          $state.go('manageService', {}, { reload: true });
        });
      });
    };

    // var registerService = function() {
    //   $rootScope.$loader.show();
    //   var serviceName = $state.params.serviceName;
    //   var onResponse = function(err) {
    //     $rootScope.$loader.hide();
    //     var msg = null;
    //     if (err) {
    //       console.error(err);
    //       msg = 'Service could not be created';
    //       return $rootScope.prompt.show('Publish Service Error', msg, function() {
    //         return $state.go('manageService');
    //       });
    //     }
    //     msg = serviceName + ' service has been published successfully';
    //     $rootScope.prompt.show('Service Published', msg, function() {
    //       $state.go('manageService');
    //     });
    //   };
    //   safe.addService($scope.longName, serviceName, false, '/public/' + serviceName, onResponse);
    // };
    //
    // $scope.uploadDirectoryForService = function() {
    //   var dialog = require('remote').dialog;
    //   dialog.showOpenDialog({
    //     title: 'Select Directory for upload',
    //     properties: [ 'openDirectory' ]
    //   }, function(folders) {
    //     if (folders.length === 0) {
    //       return;
    //     }
    //     $rootScope.$loader.show();
    //     var serviceName = $state.params.serviceName;
    //     try {
    //       var progressCallback = function(completed, total, filePath) {
    //         if ($rootScope.$loader.isLoading) {
    //           $rootScope.$loader.hide();
    //         }
    //         var progressCompletion = 100;
    //         if (!(total === 0 && completed === 0)) {
    //           progressCompletion = ((completed / total) * 100);
    //         }
    //         $scope.onProgress(progressCompletion, true);
    //         if (progressCompletion >= 100) {
    //           registerService();
    //         }
    //       };
    //       var uploader = new window.uiUtils.Uploader(safe, progressCallback);
    //       uploader.setOnErrorCallback(function(msg) {
    //           $scope.onProgress(100, false);
    //           $rootScope.prompt.show('Upload failed', msg);
    //         });
    //       uploader.upload(folders[0], false, '/public/' + serviceName);
    //     } catch (e) {
    //       console.error(e);
    //       $rootScope.$loader.hide();
    //       $rootScope.prompt.show('File Size Restriction', e.message);
    //     }
    //   });
    // };

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
