/* global $, window */

(function (MODULE) {
  class View {
    constructor (controller, targetElement) {
      this.DEFAULT_DNS_NAME = 'Anonymous'
      this.controller = controller
      this.data = controller.getData()

      this.init(targetElement || '#comments')

      // link to data driven updates
      this.controller.on('comments-updated', this._refresh.bind(this))
      this.controller.on('user-updated', this._refreshDNSList.bind(this))
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
      if (!this.controller.isAdmin()) {
        return console.error('Admin has the privilege to enable comment')
      }
      this._spinUntil(this.controller.enableComments())
    }

    showBlockedUsers () {
      const prepareTemplate = () => {
        let template = '<ul class="list-group">'
        Object.keys(this.data.blockedUsers).forEach(user => {
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
        this._spinUntil(this.controller.postComment(comment, name))
      }
    }

    deleteComment (comment, index) {
      this._spinUntil(this.controller.deleteComment(index))
    }

    blockUser (userName, index) {
      if (userName === this.DEFAULT_DNS_NAME) {
        this._toggleSpinner()
        return this._getUserNameForAnonymous(index)
      }
      this._spinUntil(this.controller.blockUser(userName, index))
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
      if (!this.controller.commentsEnabled()) {
        // indicating we aren't enbled yet
        MODULE.log('show button')
        this._toggleEnableCommentBtn(true)
      } else {
        // refresh comments
        MODULE.log('show comments')
        this._renderComments()
        this._toggleEnableCommentBtn(false)
        this._toggleCommentsInput(true)
      }
    }

    _renderComments () {
      MODULE.log('refreshing comments list')

      const isBlockedUser = (name) => {
        if (!this.data.blockedUsers) {
          return false
        }
        return !!this.data.blockedUsers.hasOwnProperty(name)
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

        if (this.controller.isAdmin()) {
          let $adminMenu = item.append('<div class="media-options"></div>')
          MODULE.log($adminMenu)

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
      if (this.data.commentList.length) {
        this.data.commentList.forEach((comment) => {
          target.append(renderComment(comment.comment, comment.index))
        })
        target.show()
      } else {
        target.hide()
      }
    }

    _refreshDNSList () {
      if (!this.data.user.dns) {
        return
      }
      this.$('#_dnsList').html(
        this.data.user.dns.map(
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

      return this._spinUntil(this.controller.unblockUser(selected))
    }

    _setUserNameForAnonymous (index) {
      const userName = this.$('#_blockUserName').val()
      this._hidePopup()
      if (this.data.blockedUsers && this.data.blockedUsers.hasOwnProperty(userName)) {
        return window.alert('User Name already exist')
      }
      this._spinUntil(this.controller.blockUser(userName, index))
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
      MODULE.log(state)
      let spinnerEle = this.$('#_commentSpinner')
      MODULE.log(spinnerEle)
      return state ? spinnerEle.show() : spinnerEle.hide()
    }

    _toggleEnableCommentBtn (status) {
      let commentEnableEle = this.$('#_commentEnable')
      MODULE.log(commentEnableEle)
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
  MODULE.View = View
})(window.safeComments)
