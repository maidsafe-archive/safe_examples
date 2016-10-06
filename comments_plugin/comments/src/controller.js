/* global $, window */

(function (MODULE) {
  class _EventEmitter {
    // jQuery Based Event Emitter
    on (name, fn) {
      return $(this).on(name, fn)
    }

    emit (name, param) {
      return $(this).trigger(name, param)
    }
  }

  function generateRandomString () {
    let text = ''
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }

  class Controller extends _EventEmitter {
    constructor () {
      super()
      // internal state
      this._hostName = window.location.host.replace(/.safenet$/g, '')
      this._LOCAL_STORAGE_TOKEN_KEY = `SAFE_TOKEN_${this._hostName}`

      this._authToken = null
      this._currentPostHandleId = null
      this._blockedUserStructureDataHandle = null

      this._symmetricCipherOptsHandle = null

      $(window).on('beforeunload', () => {
        // ensure we are cleaning up properly before closing
        if (this._currentPostHandleId) {
          window.safeAppendableData.dropHandle(this._authToken, this._currentPostHandleId)
        }
        if (this._symmetricCipherOptsHandle) {
          window.safeCipherOpts.dropHandle(this._symmetricCipherOptsHandle)
        }
      })

      this._data = new MODULE.DataContainer()
    }

    // system specifics
    init () {
      this._authToken = window.safeAuth.getAuthToken(this._LOCAL_STORAGE_TOKEN_KEY)
      return (this._authToken ? this._getDns() : this._authoriseApp())
        .then(() => this.fetchComments())
    }

    getData () {
      return this._data
    }

    getLocation () {
      if (this._isDevMode() && this._data.user.dns) {
        return "comments-dev-" + this._data.user.dns + `/${window.location.pathname}`

      }
      return `${this._hostName}/${window.location.pathname}`
    }

    isAdmin () {
      if (this._isDevMode() && this._data.user.dns) {
        return true
      }

      let currentDns = this._hostName.replace(/(^\w+\.|.safenet$)/g, '')
      if (!this._data.user.dns) {
        return
      }
      return this._data.user.dns.indexOf(currentDns) !== -1
    }

    commentsEnabled () {
      return !!this._currentPostHandleId
    }

    //
    // global activities
    //

    enableComments () {
      return window.safeAppendableData.create(this._authToken, this.getLocation(), false)
        .then((res) => res.__parsedResponseBody__.handleId)
        .then((handleId) => {
          MODULE.log('Put appendable data')
          return window.safeAppendableData.put(this._authToken, handleId)
            .then(res => { this._currentPostHandleId = handleId })
        })
        .then(() => {
          this.emit('comments-updated')
        })
    }

    //
    // comment activities
    //

    fetchComments () {
      MODULE.log('Fetch comments')
      this._data.commentList = []

      const fetchAll = (totalComments) => {
        let all = []
        for (var i = 0; i < totalComments; i++) {
          all.push(i)
        }

        // fetch all the items in parallel
        return Promise.all(
          all.map(index => this._fetchComment(index).then((c) => {
            this._data.commentList.push({
              index: index,
              comment: c
            })
          })))
      }

      // get appendable data length
      const getCommentsListLength = () => {
        MODULE.log('Fetch appendable data length')
        return window.safeAppendableData.getMetadata(
              this._authToken, this._currentPostHandleId)
          .then((res) => res.__parsedResponseBody__.dataLength)
      }

      // fetch appendableData
      const fetchCommentsListing = (dataHandleId) => {
        MODULE.log('Fetch appendable data')
        return window.safeAppendableData.getHandle(
              this._authToken, dataHandleId)
          .then((res) => { this._currentPostHandleId = res.__parsedResponseBody__.handleId })
      }

      const fetchComments = (handleId) =>
        Promise.resolve(handleId)
          .then(fetchCommentsListing)
          .then(getCommentsListLength)
          .then(fetchAll)
          .then(() => this._sortComments())
          .then((r) => this.emit('comments-updated'),
                (e) => {
                  MODULE.log(e)
                  this.emit('comments-updated')
                  return e
                })

      return this._autoRelease(
        // get handle for appendable data
        window.safeDataId.getAppendableDataHandle(this._authToken, this.getLocation()),
        // fetch the comments with that handle
        fetchComments,
        // release teh appendable data handle
        (dataIdHandle) => window.safeDataId.dropHandle(this._authToken, dataIdHandle))
    }

    postComment (comment, publicName) {
      MODULE.log(`Writing comment @${publicName}: ${comment}`)

      const timeStamp = (new Date()).getTime()
      const name = publicName + timeStamp + generateRandomString()
      const payload = new Buffer(JSON.stringify({
        name: publicName,
        comment: comment,
        time: timeStamp
      })).toString('base64')


      return this._autoRelease(
          // get handle for to be created comment
          window.safeStructuredData.create(this._authToken, name, 501, payload),
          // with that handle
          (currentSDHandleId) => window.safeStructuredData.put(this._authToken, currentSDHandleId)
            // save the data then
            .then(() => this._autoRelease(
              // replace the structured Data handle for a dataID handle
              window.safeStructuredData.getDataIdHandle(this._authToken, currentSDHandleId),
              // append that handle to the appendable data
              (dataIdHandle) => window.safeAppendableData.append(this._authToken, this._currentPostHandleId, dataIdHandle),
              // release the dataId handle
              (dataIdHandle) => window.safeDataId.dropHandle(this._authToken, dataIdHandle)
            )),
          // release the structured data handle
          (currentSDHandleId) => window.safeStructuredData.dropHandle(this._authToken, currentSDHandleId))
        // once done, refresh the comments listing
        .then(() => this.fetchComments())
    }

    deleteComment (index) {
      return window.safeAppendableData.removeAt(this._authToken, this._currentPostHandleId, index)
        .then((res) =>
          window.safeAppendableData.post(this._authToken, this._currentPostHandleId))
        .then(() =>
          window.safeAppendableData.clearAll(this._authToken, this._currentPostHandleId, true))
        .then(() => this.fetchComments())
    }

    //
    // user block management
    //

    blockUser (userName, index) {
      // get appendable data signed key at index
      return this._autoRelease(
          window.safeAppendableData.getSignKeyAt(this._authToken, this._currentPostHandleId, index),
          (signKeyHandleId) =>
            window.safeAppendableData.addToFilter(this._authToken, this._currentPostHandleId, [signKeyHandleId])
              .then(() => window.safeAppendableData.post(this._authToken, this._currentPostHandleId))
              .then(() => this._saveBlockedUser(userName, signKeyHandleId))
              .then(() => this.fetchComments()),
          (signKeyHandleId) => window.safeSignKey.dropHandle(this._authToken, signKeyHandleId))
        .then(data => this.emit('comments-updated'))
    }

    unblockUser (userName) {
      return this._autoRelease(
        // get a serialiased key
        window.safeSignKey.deserialise(this._authToken, new Buffer(this.data.blockedUsers[userName], 'base64')),
        (signKeyHandle) =>
          window.safeAppendableData.removeFromFilter(
            this._authToken,
            this._currentPostHandleId,
            [signKeyHandle])
          .then(res => window.safeAppendableData.post(
              this._authToken, this._currentPostHandleId)
          .then(res => {
            delete this.data.blockedUsers[userName]
            const data = new Buffer(JSON.stringify(this.data.blockedUsers)).toString('base64')
            return window.safeStructuredData.updateData(
                this._authToken,
                this._blockedUserStructureDataHandle,
                data, this._symmetricCipherOptsHandle)
              .then(res => window.safeStructuredData.post(
                    this._authToken, this._blockedUserStructureDataHandle)
              )
          }
          )
        ),
        // release signing key
        (signKeyHandle) => window.safeSignKey.dropHandle(this._authToken, signKeyHandle)
      )
    }

    _isDevMode () {
      return !!this._hostName.match(/^localhost(:[\d]+)?$/)
    }

    _getCypher () {
      return window.safeCipherOpts.getHandle(
          this._authToken,
          window.safeCipherOpts.getEncryptionTypes().SYMMETRIC)
        .then(res => { this._symmetricCipherOptsHandle = res.__parsedResponseBody__.handleId })
    }

    _autoRelease (promise, fn, release) {
      // wraps the pull and release cycle around your function call
      return promise
        .then(res => res.__parsedResponseBody__ ? res.__parsedResponseBody__.handleId : res)
        .then(handleId => fn(handleId)
          .then((r) => release(handleId).then(() => r),
                (e) => release(handleId).then(() => Promise.reject(e)
          ))
        )
    }

    _fetchBlockeUsersData () {
      return this._autoRelease(
        window.safeDataId.getStructuredDataHandle(
          // get dataHandle
          this._authToken, this.getLocation() + '_blocked_users', 501),
          // replace dataHandle With structuredDataHandle
          (dataHandle) => window.safeStructuredData.getHandle(this._authToken, dataHandle),
          // release dataHandle
          (dataHandle) => window.safeDataId.dropHandle(this._authToken, dataHandle))
        .then(handleId => {
          // keep the sdHandle around for later reuse
          this._blockedUserStructureDataHandle = handleId
          // and read the data with it
          return window.safeStructuredData.readData(
              this._authToken,
              this._blockedUserStructureDataHandle)
        })
    }

    _withSignedKey (signKeyHandle, fn) {
      return window.safeSignKey.serialise(this._authToken, signKeyHandle)
        .then(res => (new Buffer(res).toString('base64')))
        .then(fn)
    }

    _readAndRelease (address) {
      return this._autoRelease(
        // get dataHandle for id
        window.safeStructuredData.getHandle(this._authToken, address),
        // read structured data from dataHandle
        (handleId) => window.safeStructuredData.readData(this._authToken, handleId),
        // release datahandle
        (hId) => window.safeStructuredData.dropHandle(this._authToken, hId)
      )
    }

    _fetchComment (index) {
      return this._autoRelease(
          // get data handle for position
          window.safeAppendableData.getDataIdAt(
                this._authToken, this._currentPostHandleId, index),
          // read data at position
          (dataid) => this._readAndRelease(dataid),
          // release data handle
          (dataIdHandle) => window.safeDataId.dropHandle(this._authToken, dataIdHandle))
        .then((data) => JSON.parse(new Buffer(data).toString()))
    }

    _sortComments () {
      this.commentList.sort((a, b) => {
        return new Date((b.data || b.comment).time) - new Date((a.data || a.comment).time)
      })
    }

    _getBlockedUsersStructuredData () {
      return this._fetchBlockeUsersData()
        .then(data => { this.data.blockedUsers = JSON.parse(new Buffer(data).toString()) })
        .then(data => this.emit('comments-updated'))
        .catch(console.error)
    }

    _saveBlockedUser (userName, signKeyHandle) {
      if (this._blockedUserStructureDataHandle !== null) {
        return this._withSignedKey((serialisedSignKey) => {
          this.data.blockedUsers[userName] = serialisedSignKey
          return window.safeStructuredData.updateData(
              this._authToken,
              this._blockedUserStructureDataHandle,
              new Buffer(JSON.stringify(this.data.blockedUsers)), this._symmetricCipherOptsHandle)
            .then(res => window.safeStructuredData.post(
                this._authToken,
                this._blockedUserStructureDataHandle)
            )
        }
        )
      } else {
        return this._withSignedKey((serialisedSignKey) => {
          this.data.blockedUsers = {}
          this.data.blockedUsers[userName] = serialisedSignKey
          return window.safeStructuredData.create(
              this._authToken,
              this.getLocation() + '_blocked_users', 501,
              this.data.blockedUsers,
              this._symmetricCipherOptsHandle)
            .then(res => { this._blockedUserStructureDataHandle = res.__parsedResponseBody__.handleId })
            .then(res => window.safeStructuredData.put(
                  this._authToken,
                  this._blockedUserStructureDataHandle)
            )
        }
        )
      }
    }

    _getDns () {
      MODULE.log('Fetching DNS records')
      return window.safeDNS.getDns(this._authToken)
        .then((res) => res.__parsedResponseBody__)
        .then((dnsData) => {
          this._data.user.dns = dnsData
          if (this.isAdmin()) {
            // dont block comments loading, but do it right after
            window.setTimeout(() => this._getBlockedUsersStructuredData(), 10)
          }
          this.emit('user-updated')
        })
    }

    _authoriseApp () {
      MODULE.log('Authorising application')
      return window.safeAuth.authorise(this._data.appInfo, this._LOCAL_STORAGE_TOKEN_KEY)
        .then((res) => res.__parsedResponseBody__.token)
        .then((token) => {
          this._authToken = token
          window.safeAuth.set_AuthToken(this._LOCAL_STORAGE_TOKEN_KEY, token)
        })
        .then(() => this._getDns())
        .catch((err) => {
          console.error(err)
          this._authToken = null
        })
    }
  }

  MODULE.Controller = Controller
})(window.safeComments)
