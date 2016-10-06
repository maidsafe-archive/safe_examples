/* global $, window */

//
// This module defines the Rendering UI or `View` for the
// App
//

(function (MODULE) {
  //
  // The View Class
  //
  class View {
    constructor (controller, targetElement) {
      // set the local state
      this.DEFAULT_DNS_NAME = 'Anonymous'
      this.controller = controller
      this.data = controller.getData()

      // start up rendering
      this.init(targetElement || '#comments')

      // link to data driven updates
      this.controller.on('comments-updated', this._refresh.bind(this))
      this.controller.on('user-updated', this._refreshDNSList.bind(this))
    }

    // setup the target element
    init (elemId) {
      // try to find the element. Keep it around as `this._$`
      this._$ = $(elemId)
      if (!this._$.length) {
        throw Error('Element not found: ' + elemId)
      }
      // render initial state
      this._initialRender()
      // and link up the events
      this._setupInitialEvents()
    }

    // helper function to find a specific element
    // in the tree that we are managing
    $ (target) {
      return this._$.find(target)
    }

    //
    // Global UI
    //

    // Action to enable comments
    enableComments () {
      if (!this.controller.isAdmin()) {
        return console.error('Admin has the privilege to enable comment')
      }
      this._spinUntil(this.controller.enableComments())
    }

    // Show Popup with Blocked Users
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

    //
    // Aomment interactions
    //

    // Fired when the comment form is submitted via click
    addComment () {
      var comment = this.$('#_commentText').val()
      var name = this.$('#_dnsList').val()
      if (!!name && !!comment) {
        this._spinUntil(this.controller.postComment(comment, name))
      }
    }

    // Delete the comment at a specific index
    deleteComment (comment, index) {
      this._spinUntil(this.controller.deleteComment(index))
    }

    // block the userName at index
    blockUser (userName, index) {
      if (userName === this.DEFAULT_DNS_NAME) {
        this._toggleSpinner()
        return this._getUserNameForAnonymous(index)
      }
      this._spinUntil(this.controller.blockUser(userName, index))
    }

    //
    // Internals
    //

    // render the inital template
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

    // link the buttons from th starting template to the given
    // actions
    _setupInitialEvents () {
      this.$('#_commentOpt button').click(() => this.showBlockedUsers())
      this.$('#_commentEnable button').click(() => this.enableComments())
      this.$('#_commentForm button').click(() => this.addComment())
    }

    //
    // Data driven UI updates
    // triggered by events emitted from the controller
    //

    // the comments-updated was called, we need refresh
    _refresh () {
      // stop spinning (we were)
      this._toggleSpinner(false)

      // indicating we aren't enbled yet
      if (!this.controller.commentsEnabled()) {
        // so show the 'enable' button and disable the comments block
        this._toggleEnableCommentBtn(true)
        this._toggleCommentsInput(false)
      } else {
        // all cool, disable the enable button
        this._toggleEnableCommentBtn(false)
        // render the comments and the comment box
        this._renderComments()
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

      // template renderer per comment
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

        // admins have extra actions they can do on the item
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

      // clear out current commentsList
      let target = this.$('#_commentList')
      target.empty()

      if (this.data.commentList.length) {
        // for every comment found, render the comment at the index
        this.data.commentList.forEach((comment) => {
          target.append(renderComment(comment.comment, comment.index))
        })
        target.show()
      } else {
        // no comments found? Hide the element
        target.hide()
      }
    }

    // we received `user-updated`, refresh the DNS listing
    _refreshDNSList () {
      if (!this.data.user.dns) {
        return
      }
      this.$('#_dnsList').html(
        this.data.user.dns.map(
          (list, i) => `<option value="${list}" ${(i === 0 ? ' selected' : '')}>${list}</option>`
        ).join('\n'))
    }

    //
    // User blocking/unblocking flows
    //

    //
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

    // Show/hide Loading animation
    _toggleSpinner (state) {
      let spinnerEle = this.$('#_commentSpinner')
      return state ? spinnerEle.show() : spinnerEle.hide()
    }

    // Show/hide commentsEnable button
    _toggleEnableCommentBtn (status) {
      let commentEnableEle = this.$('#_commentEnable')
      MODULE.log(commentEnableEle)
      return status ? commentEnableEle.show() : commentEnableEle.hide()
    }

    // Show/hide comment form
    _toggleCommentsInput (state) {
      let commentInputEle = this.$('#_commentInput')
      return state ? commentInputEle.show() : commentInputEle.hide()
    }

    // helper to render a pop up
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

    // hiding the popup
    _hidePopup () {
      const popupEle = this.$('.popup')
      const popupContainer = popupEle.find('#_popupContainer')
      popupContainer.find('.head').html('')
      popupContainer.find('.content').html('')
      popupEle.find('.foot').html('')
      popupEle.hide()
    }

    // Spin until the given `promise` resolved or rejected
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

  //
  // Export the View to the MODULE namespace
  //

  MODULE.View = View
})(window.safeComments)
