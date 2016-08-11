/**
 * Public ID controller
 */
window.maidsafeDemo.controller('PublicIdCtrl', [ '$scope', '$state', '$rootScope', 'MESSAGES', 'safeApiFactory',
  function($scope, $state, $rootScope, $msg, safe) {
    'use strict';
    $scope.publicId = '';
    $scope.longName = null;

    $scope.init = function() {
      var longName = safe.getUserLongName();
      if (longName) {
        return $state.go('manageService', { longName: longName });
      }
    };

    $scope.createPublicId = function() {
      if (!$scope.publicId) {
        return $rootScope.prompt.show('Invalid data', 'Please enter a valid Public ID');
      }

      if (!(new RegExp('^[a-z0-9][a-z0-9-]{1,60}[a-z0-9](?:)+$')).test($scope.publicId)) {
        return $rootScope.prompt.show('Invalid data',
          'Public ID should be minimum of 3 characters and maximum of 63 characters. Should be lower case and should ' +
          'not contain special characters or space. In addition \'-\' is permitted if it is not at the start or end',
            function() {
              $scope.publicId = '';
              $scope.$applyAsync();
            }
        );
      }
      $rootScope.$loader.show($msg.CREATE_PUBLIC_ID);
      safe.createPublicId($scope.publicId, function(err) {
        $rootScope.$loader.hide();
        if (err) {
          return $rootScope.prompt.show('Public ID Error', 'Failed to create Public ID.', function() {
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
