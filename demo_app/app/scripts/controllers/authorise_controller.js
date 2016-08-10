/**
 * Authorisation controller
 */
window.maidsafeDemo.controller('AuthoriseCtrl', [ '$scope', '$rootScope', '$state', 'safeApiFactory',
function($scope, $rootScope, $state, safe) {
  'use strict';
  $scope.authorisationTasks = {
    state: {
      'AUTHORISING': 'authorising',
      'INITIALISING': 'initialising',
      'SUCCESS': 'success',
      'FAILURE': 'failure',
      'IN_PROGRESS': 'in_progress'
    },
    messages: {
      'AUTHORISING': 'Waiting for response...',
      'INITIALISING': 'Initialising...'
    },
    currentState: null
  };

  $scope.authorisationTasks.appSetupStatus = {
    checkingPublicName: $scope.authorisationTasks.state.IN_PROGRESS,
    checkingDirectories: $scope.authorisationTasks.state.IN_PROGRESS,
    creatingPublicDirectory: null,
    creatingPrivateDirectory: null
  };

  // initialization
  $scope.init = function() {
    var createPvtDirCb = function(err, res) {
      if (err) {
        $scope.authorisationTasks.appSetupStatus.creatingPrivateDirectory = $scope.authorisationTasks.state.FAILURE;
        return $rootScope.prompt.show('Initialisation Error', 'Failed to create private directory', function() {
          window.uiUtils.closeApp();
        }, {
          title: 'Reason',
          ctx: err.data.description
        });
      }
      $scope.authorisationTasks.appSetupStatus.creatingPrivateDirectory = $scope.authorisationTasks.state.SUCCESS;
      $state.go('home');
    };

    var createPubDirCb = function(err, res) {
      if (err) {
        $scope.authorisationTasks.appSetupStatus.creatingPublicDirectory = $scope.authorisationTasks.state.FAILURE;
        return $rootScope.prompt.show('Initialisation Error', 'Failed to create public directory', function() {
          window.uiUtils.closeApp();
        }, {
          title: 'Reason',
          ctx: err.data.description
        });
      }
      $scope.authorisationTasks.appSetupStatus.creatingPublicDirectory = $scope.authorisationTasks.state.SUCCESS;
      safe.createDir('/private', true, '', false, createPvtDirCb);
    };

    var getDirCb = function(err, res) {
      if (err) {
        $scope.authorisationTasks.appSetupStatus.checkingDirectories = $scope.authorisationTasks.state.FAILURE;
        return $rootScope.prompt.show('Initialisation Error', 'Failed to get home directory', function() {
          window.uiUtils.closeApp();
        }, {
          title: 'Reason',
          ctx: err.data.description
        });
      }
      $scope.authorisationTasks.appSetupStatus.checkingDirectories = $scope.authorisationTasks.state.SUCCESS;
      if (res.subDirectories.length === 0) {
        $scope.authorisationTasks.appSetupStatus.creatingPrivateDirectory = $scope.authorisationTasks.state.IN_PROGRESS;
        $scope.authorisationTasks.appSetupStatus.creatingPublicDirectory = $scope.authorisationTasks.state.IN_PROGRESS;
        safe.createDir('/public', false, '', false, createPubDirCb);
      } else if (res.subDirectories.length === 1) {
        $scope.authorisationTasks.appSetupStatus.creatingPrivateDirectory = $scope.authorisationTasks.state.IN_PROGRESS;
        safe.createDir('/private', true, '', false, createPvtDirCb);
      } else {
        $state.go('home');
      }
    };

    var getDnsCb = function(err, res) {
      if (err) {
        $scope.authorisationTasks.appSetupStatus.checkingPublicName = $scope.authorisationTasks.state.FAILURE;
        return $rootScope.prompt.show('Initialisation Error', 'Failed to get DNS', function() {
          window.uiUtils.closeApp();
        }, {
          title: 'Reason',
          ctx: err.data.description
        });
      }
      $scope.authorisationTasks.appSetupStatus.checkingPublicName = $scope.authorisationTasks.state.SUCCESS;
      if (res.length !== 0) {
        safe.setUserLongName(res[0]);
      }
      safe.getDir(getDirCb, '/');
    };

    var authoriseCb = function(err, res) {
      if (err) {
        console.error(err);
        $rootScope.$loader.hide();
        $rootScope.prompt.show('Authorisation failed', 'Failed to authorise with launcher.', function() {
          window.uiUtils.closeApp();
        });
        return;
      }
      $scope.authorisationTasks.currentState = $scope.authorisationTasks.state.INITIALISING;
      console.log('Application authorised');
      safe.getDns(getDnsCb);
    };

    $scope.authorisationTasks.currentState = $scope.authorisationTasks.state.AUTHORISING;
    safe.authorise(authoriseCb);
  };
} ]);
