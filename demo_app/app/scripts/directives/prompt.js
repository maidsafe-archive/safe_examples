window.maidsafeDemo.directive('prompt', [ '$rootScope', function($rootScope) {
  'use strict';

  var Prompt = function() {
    var self = this;
    self.visible = false;
    self.callback = null;

    self.close = function() {
      self.visible = false;
      if (self.callback) {
        self.callback();
      }
      self.callback = null;
    };

    self.show = function(title, msg, callback, sub) {
      if (self.visible) {
        return false;
      }
      self.title = title;
      self.msg = msg;
      self.sub = sub || {
        title: '',
        ctx: ''
      };
      self.visible = true;
      self.callback = callback;
      $rootScope.$applyAsync();
      return true;
    };
  };

  return {
    restrict: 'E',
    templateUrl: './views/prompt.html',
    link: function() {
      $rootScope.prompt = new Prompt();
    }
  };
} ]);
