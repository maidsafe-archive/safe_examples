/**
 * Public ID controller
 */
window.maidsafeDemo.controller('PublicIdCtrl', [ '$scope', '$rootScope', 'safeApiFactory',
function($scope, $rootScope, safe) {
  'use strict';
  $scope.publicId = '';
  $scope.longName = null;

  $scope.init = function() {
    var longName = safe.getUserLongName();
    if (longName) {
      $scope.longName = longName;
    }
  };

  $scope.createPublicId = function() {
    if (!$scope.publicId) {
      return console.error('Please enter a valid Public ID');
    }
    $rootScope.$loader.show();
    safe.createPublicId($scope.publicId, function(err, res) {
      $rootScope.$loader.hide();
      if (err) {
        return console.log(err);
      }
      safe.setUserLongName($scope.publicId);
      $scope.publicId = '';
      $scope.init();
      console.log(res);
    });
    console.log($scope.publicId);
  };
} ]);
