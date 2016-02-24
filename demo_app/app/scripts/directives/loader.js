/**
 * Loader directive
 */
window.maidsafeDemo.directive('msLoader', function() {
  'use strict';
  return {
    replace: true,
    scope: {},
    restrict: 'E',
    templateUrl: 'views/loader.html'
  };
});
