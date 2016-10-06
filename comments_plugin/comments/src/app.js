/* global window */
(function (MODULE) {
  class CommentsApp {
    constructor (targetElement) {
      this.controller = new MODULE.Controller(this)
      this.view = new MODULE.View(this.controller, targetElement)

      this.controller.init()
    }
  }

  MODULE.app = CommentsApp

  // Expose external API
  MODULE.init = function (destId) {
    return new CommentsApp(destId)
  }
})(window.safeComments)

window.onload = function () {
  if (window.__COMMENTS_ID) {
    // automatic invokation
    window.safeComments.init(window.__COMMENTS_ID)
  };
}
