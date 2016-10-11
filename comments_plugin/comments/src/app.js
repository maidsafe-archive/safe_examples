/* global window */

//
// This module contains the App, tying it all together
//
(function (MODULE) {
  // The App Class
  class CommentsApp {
    constructor (targetElement) {
      // create the controller
      this.controller = new MODULE.Controller()
      // tie the controller to a view
      this.view = new MODULE.View(this.controller, targetElement)

      // and initialise the controller. This will kick off the authentication flow
      this.controller.init()
    }
  }

  // Expose on the Module
  MODULE.app = CommentsApp

  // Expose external API for convenience
  MODULE.init = function (destId) {
    return new CommentsApp(destId)
  }
})(window.safeComments)

// A handy function to automatically render the
// comments on startup of the page
window.onload = function () {
  if (window.__COMMENTS_ID) {
    // automatic invokation
    window.safeComments.init(window.__COMMENTS_ID)
  };
}
