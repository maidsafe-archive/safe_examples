/**
 * Manage private data controller
 */
window.maidsafeDemo.controller('PrivateDataCtrl', [ '$scope', 'safeApiFactory', function($scope, safe) {
  'use strict';
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
    if (percentage === 100) {
      $scope.progressIndicator.show = false;
    }
    $scope.progressIndicator.percentage = Math.floor(percentage);
    console.log(percentage);
  };
} ]);
