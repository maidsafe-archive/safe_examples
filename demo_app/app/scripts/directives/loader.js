/**
 * Loader directive
 */
window.maidsafeDemo.directive('msLoader', [ function() {
  'use strict';
  var link = function(scope, ele, attrs) {
    scope.description = '';
    attrs.$observe('description', function(val) {
      scope.description = (val ? (val + '...') : '');
      scope.$applyAsync();
    });
  };
  return {
    replace: true,
    scope: {},
    restrict: 'E',
    templateUrl: 'views/loader.html',
    link: link
  };
}
]);
