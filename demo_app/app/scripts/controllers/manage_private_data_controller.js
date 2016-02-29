/**
 * Manage private data controller
 */
window.maidsafeDemo.controller('PrivateDataCtrl', ['$rootScope', '$scope', function($rootScope, $scope) {
    'use strict';

    $scope.onProgress = function(percentage, isUpload) {
      if (!$rootScope.progressBar.isDisplayed()) {
        $rootScope.progressBar.start(isUpload ? 'Uploading' : 'Downloading');
      }
      $rootScope.progressBar.update(Math.floor(percentage));
    };
  }
]);
