/**
 * Authorisation controller
 */
window.maidsafeDemo.controller('AuthoriseCtrl', [ '$scope', '$state', 'safeApiFactory', function($scope, $state, safe) {
  'use strict';
  var dirPath = '/shankar_home_new';

  $scope.authorisationTasksMsg = '';

  // initialization
  $scope.init = function() {
    var createPvtDirCb = function(err, res) {
      if (err) {
        return console.error(err);
      }
      $state.go('home');
      console.log(res);
    };

    var createPubDirCb = function(err, res) {
      if (err) {
        return console.error(err);
      }
      safe.createDir('/private', true, '', false, false, createPvtDirCb);
    };

    var getDirCb = function(err, res) {
      if (err) {
        return console.error(err);
      }
      console.log('Get Dir');
      console.log(res);
      res = JSON.parse(res);
      if (res.subDirectories.length === 0) {
        safe.createDir('/public', false, '', false, false, createPubDirCb);
      } else {
        $state.go('home');
      }
    };

    var getDnsCb = function(err, res) {
      if (err) {
        return console.error(err);
      }
      res = JSON.parse(res);
      console.log(res);
      if (res.length !== 0) {
        safe.setUserLongName(res[0]);
      }
      safe.getDir(getDirCb, '/');
    };

    var authoriseCb = function(err, res) {
      if (err) {
        console.error(err);
        return;
      }
      $scope.authorisationTasksMsg = 'Application authorised. Initialising it...';
      console.log('Application authorised');
      console.log(res);
      safe.getDns(getDnsCb);
    };
    $scope.authorisationTasksMsg = 'Authorising application';
    safe.authorise(authoriseCb);
  };
} ]);
