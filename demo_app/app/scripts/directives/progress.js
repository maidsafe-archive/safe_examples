/**
 * Progress indicator directive
 */
window.maidsafeDemo.directive('progressIndicator', [ '$rootScope', '$timeout', function($rootScope, $timeout) {
  'use strict';

  var ProgressBar = function() {
    var self = this;

    self.text = 'Status';
    self.percentageCompleted = 0;
    self.show = false;

    self.start = function(text) {
      self.text = text || 'Status';
      self.percentageCompleted = 0;
      self.show = true;
    };

    self.isDisplayed = function() {
      return self.show;
    };

    self.update = function(newValue) {
      self.percentageCompleted = newValue;
      if (self.percentageCompleted === 100) {
        $timeout(self.close, 200);
      }
    };

    self.close = function() {
      self.show = false;
      self.percentageCompleted = 0;
    };

    return self;
  };

  return {
    restrict: 'E',
    templateUrl: './views/progress.html',
    link: function() {
      $rootScope.progressBar = new ProgressBar();
    }
  };
} ]);
