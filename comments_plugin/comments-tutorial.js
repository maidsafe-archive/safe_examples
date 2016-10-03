class CommentsTutorial {
  constructor() {
    this.hostName = window.location.host.replace(/.safenet$/g, '');
    this.LOCAL_STORAGE_TOKEN_KEY = `SAFE_TOKEN_${this.hostName}`;
    this.app = {
      name: window.location.host,
      id: 'tutorial.maidsafe.net',
      version: '0.0.1',
      vendor: 'maidsafe',
      permissions: [
        'LOW_LEVEL_API'
      ]
    };

    this.DEFAULT_DNS_NAME = 'Anonymous';
    this.DEST_ELEMENT_ID = '#comments';
    this.TARGET_ELEMENT_ID = '#_commets'; // prefix with #
    this.COMMENT_ENABLE_BTN_ELEMENT_ID = '#_commentEnable'; // prefix with #
    this.COMMENT_LIST_ELEMENT_ID = '#_commentList'; // prefix with #
    this.COMMENT_TEXT_ELEMENT_ID = '#_commentText'; // prefix with #
    this.COMMENT_FORM_ELEMENT_ID = '#_commentForm'; // prefix with #
    this.COMMENT_INPUT_ELEMENT_ID = '#_commentInput'; // prefix with #
    this.DNS_LIST_ELEMENT_ID = '#_dnsList'; // prefix with #
    this.COMMENT_SPINNER_ELEMENT_ID = '#_commentSpinner'; // prefix with #
    this.COMMENT_OPTIONS_ELEMENT_ID = '#_commentOpt'; // prefix with #
    this.POPUP_CONTAINER_ELEMENT_ID = '#_popupContainer'; // prefix with #
    this.BLOCK_USERNAME_ELEMENT_ID = '#_blockUserName'; // prefix with #

    this.user = {};

    this.authToken = null;
    this.totalComments = 0;
    this.currentPostHandleId = null;
    this.commentList = [];
    this.blockedUserStructureDataHandle = null;
    this.blockedUsers = null;
    this.symmetricCipherOptsHandle = null;
    window.isAdmin = false;
  }

  toggleEnableCommentBtn(status) {
    let commentEnableEle = $(this.TARGET_ELEMENT_ID).find(this.COMMENT_ENABLE_BTN_ELEMENT_ID);
    return status ? commentEnableEle.show() : commentEnableEle.hide();
  }

  toggleComments(status) {
    let commentsEle = $(this.TARGET_ELEMENT_ID).find(this.COMMENT_LIST_ELEMENT_ID);
    return status ? commentsEle.show() : commentsEle.hide();
  }

  toggleCommentsOptions(status) {
    let commentsOptsEle = $(this.COMMENT_OPTIONS_ELEMENT_ID);
    return status ? commentsOptsEle.show() : commentsOptsEle.hide();
  }

  toggleCommentsInput(state) {
    let commentInputEle = $(this.TARGET_ELEMENT_ID).find(this.COMMENT_INPUT_ELEMENT_ID);
    return state ? commentInputEle.show() : commentInputEle.hide();
  }
  setAuthToken(token) {
    this.authToken = token;
    window.safeAuth.setAuthToken(this.LOCAL_STORAGE_TOKEN_KEY, token);
  }

  getAuthToken() {
    return window.safeAuth.getAuthToken(this.LOCAL_STORAGE_TOKEN_KEY);
  }

  clearAuthToken() {
    this.authToken = null;
  }

  isAdmin() {
    let currentDns = this.hostName.replace(/(^\w+\.|.safenet$)/g, '');
    if (!this.user.dns) {
      return;
    }
    return this.user.dns.indexOf(currentDns) !== -1;
  }

  showPopup(title, template, foot) {
    const popupEle = $('.popup');
    const popupContainer = popupEle.find(this.POPUP_CONTAINER_ELEMENT_ID);

    popupContainer.find('.head').html(title);
    popupContainer.find('.content').html(template);
    let footer = '';
    foot.forEach(opt => {
      if (!opt.name) {
        return;
      }
      footer += `<button name="close" class="btn btn-primary" onclick="${opt.call}">${opt.name}</button>`;
    });
    popupEle.find('.foot').html(footer);
    popupEle.show();
  }

  hidePopup() {
    const popupEle = $('.popup');
    const popupContainer = popupEle.find(this.POPUP_CONTAINER_ELEMENT_ID);
    popupContainer.find('.head').html('');
    popupContainer.find('.content').html('');
    popupEle.find('.foot').html('');
    popupEle.hide();
  }

  showBlockedUsers () {
    const prepareTemplate = () => {
      let template = '<ul class="list-group">';
      Object.keys(this.blockedUsers).forEach(user => {
        template += `<li class="list-group-item"><div class="checkbox"><label><input type="radio" name="blockedUsers" value="${user}"> ${user}</label></div></li>`
      });
      template += '</ul>';
      return template;
    };
    this.showPopup('Blocked Users', prepareTemplate(), [
      { name: 'Cancel', call: 'commentsTutorial.closePopup()' },
      { name: 'Unblock User', call: 'commentsTutorial.selectUnBlockUser()' }
    ]);
  }

  selectUnBlockUser() {
    const seletctedUser = $(document).find('input[name=blockedUsers]:checked').val();
    this.hidePopup();
    if (!seletctedUser) {
      return;
    }
    return this.unblockUser(seletctedUser);
  }

  setUserNameForAnonymous(index) {
    const userName = $(document).find(this.BLOCK_USERNAME_ELEMENT_ID).val();
    this.hidePopup();
    if (this.blockedUsers && this.blockedUsers.hasOwnProperty(userName)) {
      return window.alert('User Name already exist');
    }
    this.blockUser(userName, index);
  }

  getUserNameForAnonymous(index) {
    const template = '<div class="form-group row">' +
      '<div class="col-lg-12">' +
      '<div class="col-lg-12">' +
      '<input type="text" class="form-control" id="_blockUserName" placeholder="Enter Reference Name">' +
      '</div>' +
      '</div>' +
      '</div>';
    this.showPopup('Anonymous User Reference Name', template, [
      { name: 'Cancel', call: 'commentTutorial.closePopup()' },
      { name: 'Block', call: `commentTutorial.setUserNameForAnonymous(${index})` }
    ]);
  }

  getSelectedDns() {
    return $(this.DNS_LIST_ELEMENT_ID).val();
  }
  getLocation() {
    return `${this.hostName}/${window.location.pathname}`;
  }
  generateRandomString() {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for( let i=0; i < 5; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  clearComments() {
    $(this.TARGET_ELEMENT_ID).find(this.COMMENT_LIST_ELEMENT_ID).find('.media').remove();
  }

  resetCommentForm() {
    $(this.COMMENT_FORM_ELEMENT_ID)[0].reset();
  }

  toggleSpinner(state) {
    let spinnerEle = $(this.COMMENT_SPINNER_ELEMENT_ID);
    return state ? spinnerEle.show() : spinnerEle.hide();
  }

  log(str) {
    console.log((new Date()).toLocaleString() + ' :: ' + str);
  }

  errorHandler() {
    this.toggleSpinner();
  }

  postAppendableData(handleId) {
    return window.safeAppendableData.post(this.authToken, handleId);
  }

  putAppendableData(handleId) {
    return window.safeAppendableData.put(this.authToken, handleId);
  }

  dropAppendableDataHandle(handleId) {
    return window.safeAppendableData.dropHandle(this.authToken, handleId);
  }

  putStructureData(handleId) {
    return window.safeStructuredData.put(this.authToken, handleId);
  }

  dropStructuredDataHandle(handleId) {
    window.safeStructuredData.dropHandle(this.authToken, handleId);
  }

  dropDataIdHandle(dataIdHandle) {
    window.safeDataId.dropHandle(this.authToken, dataIdHandle);
  }

  getBlockedUsersStructuredData() {
    window.safeCipherOpts.getHandle(this.authToken, window.safeCipherOpts.getEncryptionTypes().SYMMETRIC)
      .then(res => {
        console.info('Got Symmetric cipher opts handle');
        this.symmetricCipherOptsHandle = res.__parsedResponseBody__.handleId;
        window.safeDataId.getStructuredDataHandle(this.authToken, this.getLocation() + '_blocked_users', 501)
          .then(res => {
            console.info('DataId handle of blocked user structured data fetched');
            const dataIdHandle = res.__parsedResponseBody__.handleId;
            window.safeStructuredData.getHandle(this.authToken, dataIdHandle)
              .then(res => {
                console.info('Blocked user structured data handle fetched');
                this.dropDataIdHandle(dataIdHandle);
                this.blockedUserStructureDataHandle = res.__parsedResponseBody__.handleId;
                window.safeStructuredData.readData(this.authToken, this.blockedUserStructureDataHandle)
                  .then(data => {
                    console.info('Blocked user structured data read');
                    this.blockedUsers = JSON.parse(new Buffer(data).toString());
                    if (Object.keys(this.blockedUsers).length > 0) {
                      this.toggleCommentsOptions(true); // enable comments unblock user button
                    }
                  }, console.error);
              }, err => {
                this.dropDataIdHandle(dataIdHandle);
                console.error(err);
                console.info('No blocked user structured data found');
              });
          }, err => {
            console.info('No blocked user structured data found');
          });
      }, console.error);
  }

  saveBlockedUser(userName, signKeyHandle) {
    console.info('Updating blocked user list');
    if (this.blockedUserStructureDataHandle !== null) {
      window.safeSignKey.serialise(this.authToken, signKeyHandle)
        .then(res => {
          const serialisedSignKey = new Buffer(res).toString('base64');
          this.blockedUsers[userName] = serialisedSignKey;
          window.safeStructuredData.updateData(this.authToken, this.blockedUserStructureDataHandle,
            new Buffer(JSON.stringify(this.blockedUsers)), this.symmetricCipherOptsHandle)
            .then(res => {
              console.info('Updated data of blocked user Structured Data');
              window.safeStructuredData.post(this.authToken, this.blockedUserStructureDataHandle)
                .then(res => {
                  window.safeSignKey.dropHandle(this.authToken, signKeyHandle);
                  this.toggleSpinner(false);
                  alert('User has been blocked');
                }, console.error);
            }, console.error);
        }, console.error);
    } else {
      window.safeSignKey.serialise(this.authToken, signKeyHandle)
        .then(res => {
          const serialisedSignKey = new Buffer(res).toString('base64');
          this.blockedUsers = {};
          this.blockedUsers[userName] = serialisedSignKey;
          const data = new Buffer(JSON.stringify(this.blockedUsers)).toString('base64');
          window.safeStructuredData.create(this.authToken, this.getLocation() + '_blocked_users', 501,
            data, this.symmetricCipherOptsHandle)
            .then(res => {
              console.info('Creating blocked user structured data');
              this.blockedUserStructureDataHandle = res.__parsedResponseBody__.handleId;
              window.safeStructuredData.put(this.authToken, this.blockedUserStructureDataHandle)
                .then(res => {
                  this.toggleSpinner(false);
                  window.safeSignKey.dropHandle(this.authToken, signKeyHandle);
                  alert('User has been blocked');
                }, console.error);
            }, console.error);
        }, console.error);
    }
  }

  unblockUser(userName) {
    window.safeSignKey.deserialise(this.authToken, new Buffer(this.blockedUsers[userName], 'base64'))
      .then(res => {
        console.info('Deserialised sign key');
        const signKeyHandle = res.__parsedResponseBody__.handleId;
        window.safeAppendableData.removeFromFilter(this.authToken, this.currentPostHandleId,
          [signKeyHandle])
          .then(res => {
            window.safeAppendableData.post(this.authToken, this.currentPostHandleId)
              .then(res => {
                delete this.blockedUsers[userName];
                const data = new Buffer(JSON.stringify(this.blockedUsers)).toString('base64');
                window.safeStructuredData.updateData(this.authToken, this.blockedUserStructureDataHandle,
                  data, this.symmetricCipherOptsHandle)
                  .then(res => {
                    console.info('Updated data of blocked user Structured Data');
                    window.safeStructuredData.post(this.authToken, this.blockedUserStructureDataHandle)
                      .then(res => {
                        window.safeSignKey.dropHandle(this.authToken, signKeyHandle);
                        alert('User has been unblocked');
                        this.fetchComments();
                      }, console.error);
                  }, console.error);
              }, console.error);
          }, console.error);
      }, console.error);
  }

  blockUser(userName, index) {
    this.log('Block User');
    let signKeyHandleId = null;
    this.toggleSpinner(true);

    // post appendable data to network
    const post = () => {
      this.log('Post appendable data');
      this.postAppendableData(this.currentPostHandleId)
        .then((res) => {
          console.log(res);
          this.saveBlockedUser(userName, signKeyHandleId);
          this.fetchComments();
        }, (err) => {
          console.error(err);
          this.errorHandler(err);
        });
    };

    const addFilter = () => {
      this.log('Add filter');
      window.safeAppendableData.addToFilter(this.authToken, this.currentPostHandleId, [signKeyHandleId])
        .then((res) => {
          console.log(res);
          post();
        }, (err) => {
          console.error(err);
          this.errorHandler(err);
        });
    };

    if (userName === this.DEFAULT_DNS_NAME) {
      this.toggleSpinner();
      return this.getUserNameForAnonymous(index);
    }

    // get appendable data signed key at index
    this.log('Get signed key at :: ' + index);
    window.safeAppendableData.getSignKeyAt(this.authToken, this.currentPostHandleId, index)
      .then((res) => {
        signKeyHandleId = res.__parsedResponseBody__.handleId;
        addFilter();
      }, (err) => {
        console.error(err);
        this.errorHandler(err);
      });
  }

  deleteComment(index) {
    this.log('Delete comment');
    if (typeof index == 'undefined') {
      return;
    }
    this.toggleSpinner(true);

    // post data to network after delete
    const post = () => {
      this.log('Post appendable data');
      this.postAppendableData(this.currentPostHandleId)
        .then((res) => {
          console.log(res);
          this.clearComments();
          this.toggleSpinner(false);
          this.fetchComments();
        }, (err) => {
          console.error(err);
          this.errorHandler(err);
        });
    };

    // clear all deleted data from appendable data
    const clearAllDeletedData = () => {
      this.log('Clear appendable deleted data');
      window.safeAppendableData.clearAll(this.authToken, this.currentPostHandleId, true)
        .then((res) => {
          post();
          console.log(res);
        }, (err) => {
          console.error(err);
          this.errorHandler(err);
        });
    };

    // remove appendable data at index
    this.log('Remove appendable data at :: ' + index);
    window.safeAppendableData.removeAt(this.authToken, this.currentPostHandleId, index)
      .then((res) => {
        this.postAppendableData(this.currentPostHandleId)
          .then((res) => {
            console.log(res);
            clearAllDeletedData();
          }, (err) => {
            console.error(err);
          });
      }, (err) => {
        console.error(err);
        this.errorHandler(err);
      });
  };

  writeComment(e) {
    this.log('Write comments');
    this.toggleSpinner(true);

    let currentSDHandleId = null;
    let content = $(this.COMMENT_TEXT_ELEMENT_ID).val();
    let publicName = this.getSelectedDns();
    let timeStamp = (new Date()).getTime();
    let name = publicName + timeStamp + this.generateRandomString();
    let payload = {
      name: publicName,
      comment: content,
      time: timeStamp
    };
    payload = new Buffer(JSON.stringify(payload)).toString('base64');

    // append structured data data handle id to appendable data
    const appendToAppendableData = (dataHandleId) => {
      this.log('Append structured data handle id');
      window.safeAppendableData.append(this.authToken, this.currentPostHandleId, dataHandleId)
        .then((res) => {
          this.dropDataIdHandle();
          this.dropStructuredDataHandle(currentSDHandleId);
          this.resetCommentForm();
          this.toggleSpinner();
          this.fetchComments();
        }, (err) => {
          // handle error
          console.error(err);
          window.alert('Could not post a comment');
          this.errorHandler(err);
        });
    };

    // get structured data data handler id
    const getSDDataHandleId = () => {
      this.log('Get structured data handle id');
      window.safeStructuredData.getDataIdHandle(this.authToken, currentSDHandleId)
        .then((res) => {
          appendToAppendableData(res.__parsedResponseBody__.handleId);
        }, (err) => {
          console.error(err);
          this.errorHandler(err);
        });
    };

    // put structured data to network
    const put = () => {
      this.log('Put structured data');
      this.putStructureData(currentSDHandleId)
        .then((res) => {
          getSDDataHandleId();
        }, (err) => {
          console.error(err);
          this.errorHandler(err);
        });
    };

    // create new structured data
    const createStructureData = () => {
      this.log('Create structured data');
      window.safeStructuredData.create(this.authToken, name, 501, payload)
        .then((res) => {
          currentSDHandleId = res.__parsedResponseBody__.handleId;
          put();
        }, (err) => {
          // handle error
          console.error(err);
          this.errorHandler(err);
        });
    };
    createStructureData();
  };

  fetchComments(){
    this.log('Fetch comments');
    let currentIndex = 0;
    this.commentList = [];

    this.toggleSpinner(true);

    const isBlockedUser = (name) => {
      let check = false;
      if (!this.blockedUsers) {
        return check;
      }
      check = this.blockedUsers.hasOwnProperty(name);
      return !!check;
    };

    // prepare comment template
    const prepareTemplate = (comment, index) => {
      let template = '<div class="media">' +
        '<div class="media-body">' +
        '<h4 class="media-heading">::HEADING::' +
        '<small>::DATE_TIME::</small>' +
        '</h4>' +
        '::CONTENT::' +
        '</div>';

      if (this.isAdmin()) {
        template += '<div class="media-options">' +
          '<button class="btn btn-danger btn-xs" type="button" onclick="window.commentsTutorial.deleteComment(::INDEX::)">Delete</button>';

        if (!isBlockedUser(comment.name)) {
          template += '<button class="btn btn-warning btn-xs" type="button" onclick="window.commentsTutorial.blockUser(\'::HEADING::\', ::INDEX::)">Block</button>';
        }

        template +='</div>';
      }

      template += '<hr></div>';
      template = template.replace(/::HEADING::/g, comment.name)
        .replace(/::DATE_TIME::/, (new Date(comment.time)).toLocaleString())
        .replace(/::CONTENT::/, comment.comment)
        .replace(/::INDEX::/g, index);

      return template;
    };

    // add comment
    const addComment = () => {
      this.clearComments();
      this.commentList.sort((a, b) => {
        return new Date(b.data.time) - new Date(a.data.time);
      });
      this.commentList.forEach((comment) => {
        let template = prepareTemplate(comment.data, comment.index);
        $(this.TARGET_ELEMENT_ID).find(this.COMMENT_LIST_ELEMENT_ID).append(template);
      });
    };


    // get structured data
    const getStructureData = (handleId) => {
      this.log('Fetch structured data');
      console.log('handle id :: ', handleId);
      window.safeStructuredData.readData(this.authToken, handleId)
        .then((data) => {
          const comment = JSON.parse(new Buffer(data).toString());
          this.commentList.unshift({
            index: currentIndex,
            data: comment
          });
          this.dropStructuredDataHandle(handleId);
          insertCommentsOnUI();
        }, (err) => {
          console.error(err);
          this.errorHandler(err);
        });
    };

    // get structured data handle
    const getStructureDataHandle = (dataHandleId) => {
      window.safeStructuredData.getHandle(this.authToken, dataHandleId)
        .then((res) => {
          this.dropDataIdHandle(dataHandleId);
          getStructureData(res.__parsedResponseBody__.handleId);
        }, (err) => {
          console.error(err);
          this.errorHandler(err);
        });
    };

    // fetch appendable data at index
    const fetchAppendableDataVal = (index) => {
      this.log('Fetch appendable data value for index :: ' + index);
      window.safeAppendableData.getDataIdAt(this.authToken, this.currentPostHandleId, index)
        .then((res) => {
          return getStructureDataHandle(res.__parsedResponseBody__.handleId);
        }, (err) => {
          console.error(err);
          this.errorHandler(err);
        });
    };

    // iterate comment
    const insertCommentsOnUI = () => {
      currentIndex = this.commentList.length % (this.totalComments + 1);
      if (this.totalComments === 0 || (currentIndex === this.totalComments)) {
        addComment();
        return this.toggleSpinner();
      }
      fetchAppendableDataVal(currentIndex);
    };

    // get appendable data length
    const getAppendableDataLength = () => {
      this.log('Fetch appendable data length');
      window.safeAppendableData.getMetadata(this.authToken, this.currentPostHandleId)
        .then((res) => {
          this.totalComments = res.__parsedResponseBody__.dataLength;
          insertCommentsOnUI();
        }, (err) => {
          // handle error
          console.error(err);
          this.errorHandler(err);
        });
    };

    // fetch appendableData
    const fetchAppendableData = (dataHandleId) => {
      this.log('Fetch appendable data');

      window.safeAppendableData.getHandle(this.authToken, dataHandleId)
        .then((res) => {
          this.toggleComments(true);
          this.toggleCommentsInput(!!this.authToken);
          this.currentPostHandleId = res.__parsedResponseBody__.handleId;
          this.dropDataIdHandle(dataHandleId);
          getAppendableDataLength();
        }, (err) => {
          console.error(err);
          this.errorHandler(err);
          if (this.isAdmin()) {
            this.toggleEnableCommentBtn(true);
          }
        });
    };

    this.log('Fetch appendable data data handle id');
    window.safeDataId.getAppendableDataHandle(this.authToken, this.getLocation())
      .then((res) => {
        console.log(res);
        fetchAppendableData(res.__parsedResponseBody__.handleId);
      }, (err) => {
        this.errorHandler(err);
        console.error(err);
      });
  };

  enableComments() {
    if (!this.isAdmin()) {
      return console.error('Admin has the privilege to enable comment');
    }
    this.toggleSpinner(true);
    this.log('Enable Comment');
    const put = (handleId) => {
      this.log('Put appendable data');
      this.putAppendableData(handleId)
        .then((res) => {
          this.toggleEnableCommentBtn(false);
          this.toggleComments(true);
          this.currentPostHandleId = handleId;
          this.toggleSpinner(false);
        }, (err) => {
          console.error(err);
          this.errorHandler(err);
        });
    };

    // create appendable data
    const createAppendableData = () => {
      this.log('Create appendable data');
      window.safeAppendableData.create(this.authToken, this.getLocation(), false)
        .then((res) => {
          put(res.__parsedResponseBody__.handleId);
        }, (err) => {
          this.errorHandler(err);
          console.error(err);
        });
    };

    createAppendableData();
  };

  addDnsList() {
    if (!this.user.dns) {
      return;
    }
    this.user.dns.forEach((list, i) => {
      let option = '<option value="' + list + '" ' + (i === 0 ? ' selected' : '') + '>' + list + '</option>';
      $(this.DNS_LIST_ELEMENT_ID).prepend(option);
    });
  };

  getDns() {
    this.log('Fetching DNS records');
    window.safeDNS.getDns(this.authToken)
      .then((res) => {
        this.user.dns = res.__parsedResponseBody__;
        this.addDnsList();
        if (this.isAdmin()) {
          this.getBlockedUsersStructuredData();
        }
        this.fetchComments();
      }, (err) => {
        console.error(err);
        this.errorHandler(err);
        if (err.message.indexOf('401 Unauthorized') !== -1) {
          return (this.authToken ? this.authoriseApp() : this.fetchComments());
        }
      });
  };

// authorise app
  authoriseApp() {
    this.log('Authorising application');
    window.safeAuth.authorise(this.app, this.LOCAL_STORAGE_TOKEN_KEY)
      .then((res) => {
        if (typeof res === 'object') {
          this.setAuthToken(res.__parsedResponseBody__.token);
        }
        this.getDns();
      }, (err) => {
        console.error(err);
        if (this.authToken) {
          this.clearAuthToken();
        }
        this.errorHandler(err);
        return this.fetchComments();
      });
  };

  loadInitialTemplate() {
    if (!this.DEST_ELEMENT_ID) {
      throw new Error('Target not found');
    }
    let initialTemplate = '<div class="comment-block center-block">' +
      '<div class="comment-spinner" id="_commentSpinner">' +
      '<div class="comment-spinner-b">' +
      '<i class="spinner" aria-hidden="true"></i>' +
      '</div>' +
      '</div>' +
      '<div class="comment-opt" id="_commentOpt">' +
      '<button type="button" class="btn btn-primary" onclick="commentTutorial.showBlockedUsers()">Unblock User</button>' +
      '</div>' +
      '<div id="_commets">' +
      '<div id="_commentEnable" class="comment-enable">' +
      '<div class="panel panel-default">' +
      '<div class="panel-body">' +
      '<button class="btn btn-primary" type="enableComments" onclick="window.commentsTutorial.enableComments()">Enable Comments</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="comments" id="_commentList">' +
      '<div class="well" id="_commentInput">' +
      '<h4>Leave a Comment:</h4>' +
      '<form role="form" id="_commentForm">' +
      '<div class="form-group">' +
      '<select class="form-control" id="_dnsList">' +
      `<option value="${this.DEFAULT_DNS_NAME}">${this.DEFAULT_DNS_NAME}</option>` +
      '</select>' +
      '</div>' +
      '<div class="form-group">' +
      '<textarea id="_commentText" class="form-control" rows="4"></textarea>' +
      '</div>' +
      '<button type="button" class="btn btn-primary" onclick="window.commentsTutorial.addComment()">Submit</button>' +
      '</form>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div id="popup" class="popup">' +
      '<div class="popup-container" id="_popupContainer">' +
      '<h3 class="head"></h3>' +
      '<div class="content"></div>' +
      '<div class="foot"></div>' +
      '</div>' +
      '</div>';
    $(this.DEST_ELEMENT_ID).html(initialTemplate);
  };

  loadComments(destId) {
    if (destId) {
      this.DEST_ELEMENT_ID = destId;
    }
    this.loadInitialTemplate();
    this.toggleSpinner(true);
    this.authToken = this.getAuthToken();
    if (!this.authToken) {
      this.authoriseApp();
    } else {
      this.getDns();
    }
    $(window).on('beforeunload', () => {
      if (this.currentPostHandleId) {
        this.dropAppendableDataHandle(this.currentPostHandleId);
      }
    });
  }
}

const commentTutorial = new CommentsTutorial();

window.commentsTutorial = {
  loadComments: (destId) => {
    commentTutorial.loadComments(destId);
  },
  enableComments: () => {
    commentTutorial.enableComments();
  },
  addComment: (e) => {
    commentTutorial.writeComment(e);
  },
  deleteComment: (ele, index) => {
    commentTutorial.deleteComment(ele, index);
  },
  blockUser: (userName, index) => {
    commentTutorial.blockUser(userName, index);
  },
  getBlockedUsers: () => {
    return commentTutorial.blockedUsers ? Object.keys(commentTutorial.blockedUsers) : [];
  },
  unBlockUser: (userName) => {
    commentTutorial.unblockUser(userName);
  },
  showBlockedUsers: () => {
    commentTutorial.showBlockedUsers();
  },
  closePopup: () => {
    commentTutorial.hidePopup();
  },
  setBlockUserName: () => {
    commentTutorial.setBlockUserName();
  },
  selectUnBlockUser: () => {
    commentTutorial.selectUnBlockUser();
  },
  setUserNameForAnonymous: () => {
    commentTutorial.setUserNameForAnonymous();
  }
};
