/**
 * Manage private data controller
 */
window.maidsafeDemo.controller('PrivateDataCtrl', [ '$scope', '$timeout', 'safeApiFactory',
  function($scope, $timeout, safe) {
    'use strict';
    var PROGRESS_DELAY = 500;
    $scope.progressIndicator = null;
    $scope.registerProgress = function(progressScope) {
      $scope.progressIndicator = progressScope;
    };
    // set target folder
    $scope.setTargetFolder = function(path) {
      // $scope.newServicePath = path;
    };

    $scope.onUpload = function(percentage) {
      if (percentage < 100 && !$scope.progressIndicator.show) {
        $scope.progressIndicator.show = true;
      }
      $scope.progressIndicator.percentage = Math.floor(percentage);
      if (percentage === 100) {
        $timeout(function() {
          $scope.progressIndicator.show = false;
        }, PROGRESS_DELAY);
      }
      console.log(percentage);
    };
  }
]);
