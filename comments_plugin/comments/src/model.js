(function (MODULE) {
  class DataContainer {
    constructor () {
      this.user = {}
      this.commentList = []
      this.blockedUsers = null
      this.appInfo = {
        name: window.location.host,
        id: 'tutorial.maidsafe.net',
        version: '0.1.0',
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

  MODULE.DataContainer = DataContainer
})(window.safeComments)
