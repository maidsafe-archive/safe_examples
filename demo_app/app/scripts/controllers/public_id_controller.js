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

      if (!(new RegExp('^[a-z0-9][a-z0-9-]{1,61}[a-z0-9](?:)+$')).test($scope.publicId)) {
        return $rootScope.prompt.show('Invalid data',
          'Public ID should be lower case and should not contain special characters\
          and space. In addition the hyphen is permitted if it is surrounded by characters,\
          digits or hyphens, although it is not to start or end a label', function() {
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
          }, {
            title: 'Reason',
            ctx: err.data.description
          });
        }
        safe.setUserLongName($scope.publicId);
        $scope.publicId = '';
        $scope.init();
      });
    };
  }
]);
