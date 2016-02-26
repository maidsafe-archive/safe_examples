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
      // return console.error('Please enter a valid Public ID');
      return $rootScope.$msPrompt.show('Invalid data', 'Please enter a valid Public ID', function(status) {
        $rootScope.$msPrompt.hide();
      });
    }
    if (!safe.isAlphaNumeric($scope.publicId)) {
      return $rootScope.$msPrompt.show('Invalid data', 'Public ID should not contain special characters, Uppercase or space', function(status) {
        $rootScope.$msPrompt.hide();
        $scope.publicId = '';
        $scope.$applyAsync();
      });
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
