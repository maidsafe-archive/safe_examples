/* global window, console */

(function (MODULE) {
  if (console && console.log) {
    MODULE.log = (inp) => console.log((new Date()).toLocaleString() + ' :: ', inp)
  } else {
    MODULE.log = function () {}  // noop
  }
})(window.safeComments)
