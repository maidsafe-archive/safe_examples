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
        return $rootScope.prompt.show('Invalid data', 'Please enter a valid Public ID');
      }
      if (!$rootScope.isOnlyAlphaOrNumeric($scope.publicId)) {
        return $rootScope.prompt.show('Invalid data',
          'Public ID should not contain special characters, Uppercase or space', function() {
          $scope.publicId = '';
          $scope.$applyAsync();
        });
      }
      $rootScope.$loader.show();
      safe.createPublicId($scope.publicId, function(err) {
        $rootScope.$loader.hide();
        if (err) {
          return $rootScope.prompt.show('Public ID Error', err, function() {
            $scope.publicId = '';
            $scope.$applyAsync();
          });
        }
        safe.setUserLongName($scope.publicId);
        $scope.publicId = '';
        $scope.init();
      });
    };
  }
]);
