/**
 * Progress indicator directive
 */
window.maidsafeDemo.directive('progressIndicator', [ '$rootScope', '$timeout', function($rootScope, $timeout) {
  'use strict';

  var ProgressBar = function(rootScope) {
    var self = this;

    self.text = 'Status';
    self.percentageCompleted = 0;
    self.show = false;
    self.statusText = '';

    self.start = function(text) {
      self.text = text || 'Status';
      self.percentageCompleted = 0;
      self.show = true;
    };

    self.isDisplayed = function() {
      return self.show;
    };

    self.update = function(newValue, statusText) {
      self.percentageCompleted = newValue;
      if (self.percentageCompleted === 100) {
        $timeout(self.close, 200);
      }
      self.statusText = statusText || '';
      $rootScope.$applyAsync();
    };

    self.close = function() {
      self.show = false;
      self.percentageCompleted = 0;
    };

    self.cancel = function() {
      rootScope.$broadcast('cancel-upload');
    }

    return self;
  };

  return {
    restrict: 'E',
    templateUrl: './views/progress.html',
    link: function() {
      $rootScope.progressBar = new ProgressBar($rootScope);
    }
  };
} ]);
