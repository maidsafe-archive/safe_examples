
 // This Module contains a minimal DataContainer for our
 // local state

(function (MODULE) {
  // The Data container itself
  class DataContainer {
    constructor () {
      this.user = {}
      this.commentList = []
      this.blockedUsers = null
      this.appInfo = {
        name: window.location.host,
        id: 'tutorial.maidsafe.net',
        version: '0.2.0',
        vendor: 'maidsafe',
        permissions: [
          'LOW_LEVEL_API'
        ]
      }
    }
    version () {
      return this.appInfo.version
    }
  }

  // Expose the class on the external API
  MODULE.DataContainer = DataContainer
})(window.safeComments)
