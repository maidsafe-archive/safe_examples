/**
 * Porgress indicator directive
 */
window.maidsafeDemo.directive('progressIndicator', [ function() {
  'use strict';
  var link = function(scope, element, attr) {
    scope.percentage = 0;
    scope.show = false;
    scope.register({
      scope: scope
    });
  };

  return {
    restrict: 'E',
    scope: {
      register: '&'
    },
    templateUrl: './views/progress.html',
    link: link
  };
} ]);
