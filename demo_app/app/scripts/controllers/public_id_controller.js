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

      if (!(new RegExp('^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:)+$')).test($scope.publicId)) {
        return $rootScope.prompt.show('Invalid data',
          'Public ID entered is invalid', function() {
          $scope.publicId = '';
          $scope.$applyAsync();
        });
      }
      $rootScope.$loader.show();
      safe.createPublicId($scope.publicId, function(err) {
        $rootScope.$loader.hide();
        if (err) {
          return $rootScope.prompt.show('Public ID Error', 'Public ID is already taken.', function() {
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
