/* global $, window, console */
function log (inp) {
  console.log ? console.log((new Date()).toLocaleString() + ' :: ', inp) : ''
}


function generateRandomString () {
  let text = ''
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

class _EventEmitter {
  // jQuery Based Event Emitter
  on (name, fn) {
    return $(this).on(name, fn)
  }

  emit (name, param) {
    return $(this).trigger(name, param)
  }
}


class CommentsView {
  constructor (app, targetElement) {
    this.DEFAULT_DNS_NAME = 'Anonymous'
    this.app = app

    this.init(targetElement || '#comments')

    // link to data driven updates
    this.app.data.on('comments-updated', this._refresh.bind(this))
    this.app.data.on('dns-updated', this._refreshDNSList.bind(this))
  }

  init (elemId) {
    this._$ = $(elemId)
    if (!this._$.length) {
      throw Error('Element not found: ' + elemId)
    }
    this._initialRender()
    this._setupInitialEvents()
  }

  $ (target) {
    return this._$.find(target)
  }

  // Global UI

  enableComments () {
    if (!this.app.data.isAdmin()) {
      return console.error('Admin has the privilege to enable comment')
    }
    this._spinUntil(this.app.data.enableComments())
  }

  showBlockedUsers () {
    const prepareTemplate = () => {
      let template = '<ul class="list-group">'
      Object.keys(this.app.data.blockedUsers).forEach(user => {
        template += `<li class="list-group-item">
        <div class="checkbox">
          <label>
            <input type="radio" name="blockedUsers" value="${user}"> ${user}
          </label>
        </div>
      </li>`
      })
      template += '</ul>'
      return template
    }
    this._showPopup('Blocked Users', prepareTemplate(), [
      { name: 'Cancel', call: () => this.closePopup() },
      { name: 'Unblock User', call: () => this._selectUnBlockUser() }
    ])
  }

  // comment interactions
  addComment () {
    var comment = this.$('#_commentText').val()
    var name = this.$('#_dnsList').val()
    if (!!name && !!comment) {
      this._spinUntil(this.app.data.postComment(comment, name))
    }
  }

  deleteComment (comment, index) {
    this._spinUntil(this.app.data.deleteComment(index))
  }

  blockUser (userName, index) {
    if (userName === this.DEFAULT_DNS_NAME) {
      this._toggleSpinner()
      return this._getUserNameForAnonymous(index)
    }
    this._spinUntil(this.app.data.blockUser(userName, index))
  }

  // internal init
  _initialRender () {
    this._$.html(`
    <div class="comment-block center-block">
      <div class="comment-spinner" id="_commentSpinner">
        <div class="comment-spinner-b">
          <i class="spinner" aria-hidden="true"></i>
        </div>
      </div>
      <div class="comment-opt" id="_commentOpt">
        <button type="button" class="btn btn-primary">Unblock User</button>
      </div>
      <div id="_comments">
        <div id="_commentEnable" class="comment-enable">
          <div class="panel panel-default">
            <div class="panel-body">
              <button class="btn btn-primary" type="enableComments" >Enable Comments</button>
            </div>
          </div>
        </div>
        <div class="well" id="_commentInput">
          <h4>Leave a Comment:</h4>
          <form role="form" id="_commentForm">
            <div class="form-group">
              <select class="form-control" id="_dnsList">
                <option value="${this.DEFAULT_DNS_NAME}">${this.DEFAULT_DNS_NAME}</option>
              </select>
            </div>
            <div class="form-group">
              <textarea id="_commentText" class="form-control" rows="4"></textarea>
            </div>
            <button type="button" class="btn btn-primary">Submit</button>
          </form>
        </div>
        <div class="comments" id="_commentList">
        </div>
      </div>
    </div>
    <div id="popup" class="popup">
      <div class="popup-container" id="_popupContainer">
        <h3 class="head"></h3>
        <div class="content">
        </div>
        <div class="foot">
        </div>
      </div>
    </div>`)
  }

  _setupInitialEvents () {
    this.$('#_commentOpt button').click(() => this.showBlockedUsers())
    this.$('#_commentEnable button').click(() => this.enableComments())
    this.$('#_commentForm button').click(() => this.addComment())
  }

  // Data driven UI updates

  _refresh () {
    this._toggleSpinner(false)
    if (!this.app.data.commentsEnabled()) {
      // indicating we aren't enbled yet
      log('show button')
      this._toggleEnableCommentBtn(true)
    } else {
      // refresh comments
      log('show comments')
      this._renderComments()
      this._toggleEnableCommentBtn(false)
      this._toggleCommentsInput(true)
    }
  }

  _renderComments () {
    log('refreshing comments list')

    const isBlockedUser = (name) => {
      if (!this.app.data.blockedUsers) {
        return false
      }
      return !!this.app.data.blockedUsers.hasOwnProperty(name)
    }

    // prepare comment template
    const renderComment = (comment, index) => {
      let item = $(`
      <div class="media">
        <div class="media-body">
          <h4 class="media-heading">${comment.name}
            <small>${(new Date(comment.time)).toLocaleString()}</small>
          </h4>
          ${comment.comment}
        </div>
      </div>`)

      if (this.app.data.isAdmin()) {
        let $adminMenu = item.append('<div class="media-options"></div>')
        log($adminMenu)

        $adminMenu.append($(
          `<button class="btn btn-danger btn-xs" type="button">Delete</button>`
          ).click(() => this.deleteComment(comment, index)))

        if (!isBlockedUser(comment.name)) {
          $adminMenu.append($(
            `<button class="btn btn-warning btn-xs" type="button" >Block</button>`
          ).click(() => this.blockUser(comment.name, index)))
        }
      }
      return item
    }

    // render comments
    let target = this.$('#_commentList')
    target.empty()
    if (this.app.data.commentList.length) {
      this.app.data.commentList.forEach((comment) => {
        target.append(renderComment(comment.comment, comment.index))
      })
      target.show()
    } else {
      target.hide()
    }
  }

  _refreshDNSList () {
    if (!this.app.data.user.dns) {
      return
    }
    this.$('#_dnsList').html(
      this.app.data.user.dns.map(
        (list, i) => `<option value="${list}" ${(i === 0 ? ' selected' : '')}>${list}</option>`
      ).join('\n'))
  }

  // User blocking flow
  _selectUnBlockUser () {
    const selected = this.$('input[name=blockedUsers]:checked').val()
    this._hidePopup()
    if (!selected) {
      return
    }

    return this._spinUntil(this.app.data.unblockUser(selected))
  }

  _setUserNameForAnonymous (index) {
    const userName = this.$('#_blockUserName').val()
    this._hidePopup()
    if (this.app.data.blockedUsers && this.app.data.blockedUsers.hasOwnProperty(userName)) {
      return window.alert('User Name already exist')
    }
    this._spinUntil(this.app.data.blockUser(userName, index))
  }

  _getUserNameForAnonymous (index) {
    const template = `
    <div class="form-group row">
      <div class="col-lg-12">
        <div class="col-lg-12">
          <input type="text" class="form-control" id="_blockUserName" placeholder="Enter Reference Name">
        </div>
      </div>
    </div>`
    this._showPopup('Anonymous User Reference Name', template, [
        { name: 'Cancel', call: this.closePopup() },
        { name: 'Block', call: () => this._setUserNameForAnonymous(index) }
    ])
  }

  // General UI Features
  _toggleSpinner (state) {
    log(state)
    let spinnerEle = this.$('#_commentSpinner')
    log(spinnerEle)
    return state ? spinnerEle.show() : spinnerEle.hide()
  }

  _toggleEnableCommentBtn (status) {
    let commentEnableEle = this.$('#_commentEnable')
    log(commentEnableEle)
    return status ? commentEnableEle.show() : commentEnableEle.hide()
  }

  _toggleComments (status) {
    let commentsEle = this.$('#_commentList')
    return status ? commentsEle.show() : commentsEle.hide()
  }

  _toggleCommentsOptions (status) {
    let commentsOptsEle = this.$('#_commentOpt')
    return status ? commentsOptsEle.show() : commentsOptsEle.hide()
  }

  _toggleCommentsInput (state) {
    let commentInputEle = this.$('#_commentInput')
    return state ? commentInputEle.show() : commentInputEle.hide()
  }

  _showPopup (title, template, foot) {
    const popupEle = this.$('.popup')
    const popupContainer = popupEle.find('#_popupContainer')
    const footer = popupEle.find('.foot')

    popupContainer.find('.head').html(title)
    popupContainer.find('.content').html(template)
    foot.forEach(opt => {
      if (!opt.name) {
        return
      }
      $(footer.appendChild(`
        <button name="close" class="btn btn-primary" >${opt.name}</button>`)).click(opt.call)
    })
    popupEle.show()
  }

  _hidePopup () {
    const popupEle = this.$('.popup')
    const popupContainer = popupEle.find('#_popupContainer')
    popupContainer.find('.head').html('')
    popupContainer.find('.content').html('')
    popupEle.find('.foot').html('')
    popupEle.hide()
  }

  // UI helpers:
  _spinUntil (promise) {
    this._toggleSpinner(true)
    return promise.then(
      (res) => this._toggleSpinner(false),
      (err) => {
        console.error(err)
        this._toggleSpinner(false)
      }
    )
  }

}

class CommentsData extends _EventEmitter {
  constructor (app) {
    super()
    this.hostName = window.location.host.replace(/.safenet$/g, '')
    this.LOCAL_STORAGE_TOKEN_KEY = `SAFE_TOKEN_${this.hostName}`
    this.appInfo = {
      name: window.location.host,
      id: 'tutorial.maidsafe.net',
      version: '0.1.0',
      vendor: 'maidsafe',
      permissions: [
        'LOW_LEVEL_API'
      ]
    }

    this.user = {}

    this.authToken = null
    this.totalComments = 0
    this.currentPostHandleId = null
    this.commentList = []
    this.blockedUserStructureDataHandle = null
    this.blockedUsers = null
    this.symmetricCipherOptsHandle = null

    $(window).on('beforeunload', () => {
      // ensure we are cleaning up properly before closing
      if (this.currentPostHandleId) {
        window.safeAppendableData.dropHandle(this.authToken, this.currentPostHandleId)
      }
      if (this.symmetricCipherOptsHandle) {
        window.safeCipherOpts.dropHandle(this.symmetricCipherOptsHandle)
      }
    })
  }

  // system specifics
  init () {
    this.authToken = window.safeAuth.getAuthToken(this.LOCAL_STORAGE_TOKEN_KEY)
    return (this.authToken ? this._getDns() : this._authoriseApp())
      .then(() => this.fetchComments())
  }

  version () {
    return this.appInfo.version
  }

  getLocation () {
    // FIXME: this means we are globally all trying the same ...
    return `${this.hostName}/${window.location.pathname}/1`
  }

  isAdmin () {
    if (this._isDevMode()) {
      return true
    }

    let currentDns = this.hostName.replace(/(^\w+\.|.safenet$)/g, '')
    if (!this.user.dns) {
      return
    }
    return this.user.dns.indexOf(currentDns) !== -1
  }

  commentsEnabled () {
    return !!this.currentPostHandleId
  }

  //
  // global activities
  //

  enableComments () {
    return window.safeAppendableData.create(this.authToken, this.getLocation(), false)
      .then((res) => res.__parsedResponseBody__.handleId)
      .then((handleId) => {
        log('Put appendable data')
        return window.safeAppendableData.put(this.authToken, handleId)
          .then(res => { this.currentPostHandleId = handleId })
      })
      .then(() => {
        this.emit('comments-updated')
      })
  }

  //
  // comment activities
  //

  fetchComments () {
    log('Fetch comments')
    this.commentList = []

    const fetchAll = () => {
      let all = []
      for (var i = 0; i < this.totalComments; i++) {
        all.push(i)
      }

      // fetch all the items in parallel
      return Promise.all(
        all.map(index => this._fetchComment(index).then((c) => {
          this.commentList.push({
            index: index,
            comment: c
          })
        })))
    }

    // get appendable data length
    const getCommentsListLength = () => {
      log('Fetch appendable data length')
      return window.safeAppendableData.getMetadata(
            this.authToken, this.currentPostHandleId)
        .then((res) => { this.totalComments = res.__parsedResponseBody__.dataLength })
    }

    // fetch appendableData
    const fetchCommentsListing = (dataHandleId) => {
      log('Fetch appendable data')
      return window.safeAppendableData.getHandle(
            this.authToken, dataHandleId)
        .then((res) => { this.currentPostHandleId = res.__parsedResponseBody__.handleId })
    }

    const fetchComments = (handleId) =>
      Promise.resolve(handleId)
        .then(fetchCommentsListing)
        .then(getCommentsListLength)
        .then(fetchAll)
        .then(() => this._sortComments())
        .then((r) => this.emit('comments-updated'),
              (e) => {
                log(e)
                this.emit('comments-updated')
                return e
              })

    return this._autoRelease(
      // get handle for appendable data
      window.safeDataId.getAppendableDataHandle(this.authToken, this.getLocation()),
      // fetch the comments with that handle
      fetchComments,
      // release teh appendable data handle
      (dataIdHandle) => window.safeDataId.dropHandle(this.authToken, dataIdHandle))
  }

  postComment (comment, publicName) {
    log(`Writing comment @${publicName}: ${comment}`)

    const timeStamp = (new Date()).getTime()
    const name = publicName + timeStamp + generateRandomString()
    const payload = new Buffer(JSON.stringify({
      name: publicName,
      comment: comment,
      time: timeStamp
    })).toString('base64')

    console.log(this.authToken, "name", name, "payload", payload)

    return this._autoRelease(
        // get handle for to be created comment
        window.safeStructuredData.create(this.authToken, name, 501, payload),
        // with that handle
        (currentSDHandleId) => window.safeStructuredData.put(this.authToken, currentSDHandleId)
          // save the data then
          .then(() => this._autoRelease(
            // replace the structured Data handle for a dataID handle
            window.safeStructuredData.getDataIdHandle(this.authToken, currentSDHandleId),
            // append that handle to the appendable data
            (dataIdHandle) => {
              console.log(this.authToken, currentSDHandleId, this.currentPostHandleId, dataIdHandle)
              return window.safeAppendableData.append(this.authToken, this.currentPostHandleId, dataIdHandle)
            },
            // release the dataId handle
            (dataIdHandle) => window.safeDataId.dropHandle(this.authToken, dataIdHandle)
          )),
        // release the structured data handle
        (currentSDHandleId) => window.safeStructuredData.dropHandle(this.authToken, currentSDHandleId))
      // once done, refresh the comments listing
      .then(() => this.fetchComments())
  }

  deleteComment (index) {
    return window.safeAppendableData.removeAt(this.authToken, this.currentPostHandleId, index)
      .then((res) =>
        window.safeAppendableData.post(this.authToken, this.currentPostHandleId))
      .then(() =>
        window.safeAppendableData.clearAll(this.authToken, this.currentPostHandleId, true))
      .then(() => this.fetchComments())
  }

  //
  // user block management
  //

  blockUser (userName, index) {
    // get appendable data signed key at index
    return this._autoRelease(
        window.safeAppendableData.getSignKeyAt(this.authToken, this.currentPostHandleId, index),
        (signKeyHandleId) =>
          window.safeAppendableData.addToFilter(this.authToken, this.currentPostHandleId, [signKeyHandleId])
            .then(() => window.safeAppendableData.post(this.authToken, this.currentPostHandleId))
            .then(() => this._saveBlockedUser(userName, signKeyHandleId))
            .then(() => this.fetchComments()),
        (signKeyHandleId) => window.safeSignKey.dropHandle(this.authToken, signKeyHandleId))
      .then(data => this.emit('comments-updated'))
  }

  unblockUser (userName) {
    return this._autoRelease(
      // get a serialiased key
      window.safeSignKey.deserialise(this.authToken, new Buffer(this.blockedUsers[userName], 'base64')),
      (signKeyHandle) =>
        window.safeAppendableData.removeFromFilter(
          this.authToken,
          this.currentPostHandleId,
          [signKeyHandle])
        .then(res => window.safeAppendableData.post(
            this.authToken, this.currentPostHandleId)
        .then(res => {
          delete this.blockedUsers[userName]
          const data = new Buffer(JSON.stringify(this.blockedUsers)).toString('base64')
          return window.safeStructuredData.updateData(
              this.authToken,
              this.blockedUserStructureDataHandle,
              data, this.symmetricCipherOptsHandle)
            .then(res => window.safeStructuredData.post(
                  this.authToken, this.blockedUserStructureDataHandle)
            )
        }
        )
      ),
      // release signing key
      (signKeyHandle) => window.safeSignKey.dropHandle(this.authToken, signKeyHandle)
    )
  }

  _isDevMode () {
    return !!this.hostName.match(/^localhost(:[\d]+)?$/)
  }

  _getCypher () {
    return window.safeCipherOpts.getHandle(
        this.authToken,
        window.safeCipherOpts.getEncryptionTypes().SYMMETRIC)
      .then(res => { this.symmetricCipherOptsHandle = res.__parsedResponseBody__.handleId })
  }

  _autoRelease (promise, fn, release) {
    // wraps the pull and release cycle around your function call
    return promise
      .then(res => res.__parsedResponseBody__ ? res.__parsedResponseBody__.handleId : res)
      .then(handleId => fn(handleId)
        .then((r) => release(handleId).then(() => r),
              (e) => release(handleId).then( () => Promise.reject(e)
        ))
      )
  }

  _fetchBlockeUsersData () {
    return this._autoRelease(
      window.safeDataId.getStructuredDataHandle(
        // get dataHandle
        this.authToken, this.getLocation() + '_blocked_users', 501),
        // replace dataHandle With structuredDataHandle
        (dataHandle) => window.safeStructuredData.getHandle(this.authToken, dataHandle),
        // release dataHandle
        (dataHandle) => window.safeDataId.dropHandle(this.authToken, dataHandle))
      .then(handleId => {
        // keep the sdHandle around for later reuse
        this.blockedUserStructureDataHandle = handleId
        // and read the data with it
        return window.safeStructuredData.readData(
            this.authToken,
            this.blockedUserStructureDataHandle)
      })
  }

  _withSignedKey (signKeyHandle, fn) {
    return window.safeSignKey.serialise(this.authToken, signKeyHandle)
      .then(res => (new Buffer(res).toString('base64')))
      .then(fn)
  }

  _readAndRelease (address) {
    return this._autoRelease(
      // get dataHandle for id
      window.safeStructuredData.getHandle(this.authToken, address),
      // read structured data from dataHandle
      (handleId) => window.safeStructuredData.readData(this.authToken, handleId),
      // release datahandle
      (hId) => window.safeStructuredData.dropHandle(this.authToken, hId)
    )
  }

  _fetchComment (index) {
    return this._autoRelease(
        // get data handle for position
        window.safeAppendableData.getDataIdAt(
              this.authToken, this.currentPostHandleId, index),
        // read data at position
        (dataid) => this._readAndRelease(dataid),
        // release data handle
        (dataIdHandle) => window.safeDataId.dropHandle(this.authToken, dataIdHandle))
      .then((data) => JSON.parse(new Buffer(data).toString()))
  }

  _sortComments () {
    this.commentList.sort((a, b) => {
      return new Date((b.data || b.comment).time) - new Date((a.data || a.comment).time)
    })
  }

  _getBlockedUsersStructuredData () {
    return this._fetchBlockeUsersData()
      .then(data => { this.blockedUsers = JSON.parse(new Buffer(data).toString()) })
      .then(data => this.emit('comments-updated'))
      .catch(console.error)
  }

  _saveBlockedUser (userName, signKeyHandle) {
    if (this.blockedUserStructureDataHandle !== null) {
      return this._withSignedKey((serialisedSignKey) => {
        this.blockedUsers[userName] = serialisedSignKey
        return window.safeStructuredData.updateData(
            this.authToken,
            this.blockedUserStructureDataHandle,
            new Buffer(JSON.stringify(this.blockedUsers)), this.symmetricCipherOptsHandle)
          .then(res => window.safeStructuredData.post(
              this.authToken,
              this.blockedUserStructureDataHandle)
          )
      }
      )
    } else {
      return this._withSignedKey((serialisedSignKey) => {
        this.blockedUsers = {}
        this.blockedUsers[userName] = serialisedSignKey
        return window.safeStructuredData.create(
            this.authToken,
            this.getLocation() + '_blocked_users', 501,
            this.blockedUsers,
            this.symmetricCipherOptsHandle)
          .then(res => { this.blockedUserStructureDataHandle = res.__parsedResponseBody__.handleId })
          .then(res => window.safeStructuredData.put(
                this.authToken,
                this.blockedUserStructureDataHandle)
          )
      }
      )
    }
  }

  _getDns () {
    log('Fetching DNS records')
    return window.safeDNS.getDns(this.authToken)
      .then((res) => res.__parsedResponseBody__)
      .then((dnsData) => {
        this.user.dns = dnsData
        if (this.isAdmin()) {
          // dont block comments loading, but do it right after
          window.setTimeout(() => this._getBlockedUsersStructuredData(), 10)
        }
        this.emit('dns-updated')
      })
  }

  _authoriseApp () {
    log('Authorising application')
    return window.safeAuth.authorise(this.appInfo, this.LOCAL_STORAGE_TOKEN_KEY)
      .then((res) => res.__parsedResponseBody__.token)
      .then((token) => {
        this.authToken = token
        window.safeAuth.setAuthToken(this.LOCAL_STORAGE_TOKEN_KEY, token)
      })
      .then(() => this._getDns())
      .catch((err) => {
        console.error(err)
        this.authToken = null
      })
  }
}

class CommentsTutorial {
  constructor (targetElement) {
    this.data = new CommentsData(this)
    this.view = new CommentsView(this, targetElement)

    this.data.init()
  }
}

// Expose external API
window.commentsTutorial = {
  loadComments: (destId) => {
    return new CommentsTutorial(destId)
  }
}

window.onload = function () {
  if (window.__COMMENTS_ID) {
    // automatic invokation
    log('in', window.__COMMENTS_ID)
    window.commentsTutorial.loadComments(window.__COMMENTS_ID)
  };
}
