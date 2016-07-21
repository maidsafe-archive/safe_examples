/**
 * Authorisation controller
 */
window.maidsafeDemo.controller('AuthoriseCtrl', [ '$scope', '$rootScope', '$state', 'safeApiFactory', function($scope, $rootScope, $state, safe) {
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
    creatingPublicDirectory: $scope.authorisationTasks.state.IN_PROGRESS,
    creatingPrivateDirectory: $scope.authorisationTasks.state.IN_PROGRESS
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
        safe.createDir('/public', false, '', false, createPubDirCb);
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
    };

    var authoriseCb = function(err, res) {
      if (err) {
        console.error(err);
        return;
      }
      $scope.authorisationTasks.currentState = $scope.authorisationTasks.state.INITIALISING;
      console.log('Application authorised');
      safe.getDns(getDnsCb);
      safe.getDir(getDirCb, '/');
    };

    $scope.authorisationTasks.currentState = $scope.authorisationTasks.state.AUTHORISING;
    safe.authorise(authoriseCb);
  };
} ]);
