class CommentsTutorial {
  constructor() {
    this.LOCAL_STORAGE_TOKEN_KEY = 'SAFE_TOKEN';
    this.app = {
      name: "Comment tutorial plugin",
      id: "tutorial.maidsafe.net",
      version: "0.0.1",
      vendor: "maidsafe",
      permissions: [
        'LOW_LEVEL_API'
      ]
    };

    this.DEST_ELEMENT_ID = '#comments';
    this.TARGET_ELEMENT_ID = '#_commets'; // prefix with #
    this.COMMENT_ENABLE_BTN_ELEMENT_ID = '#_commentEnable'; // prefix with #
    this.COMMENT_LIST_ELEMENT_ID = '#_commentList'; // prefix with #
    this.COMMENT_TEXT_ELEMENT_ID = '#_commentText'; // prefix with #
    this.COMMENT_FORM_ELEMENT_ID = '#_commentForm'; // prefix with #
    this.COMMENT_INPUT_ELEMENT_ID = '#_commentInput'; // prefix with #
    this.DNS_LIST_ELEMENT_ID = '#_dnsList'; // prefix with #
    this.COMMENT_SPINNER_ELEMENT_ID = '#_commentSpinner'; // prefix with #
    this.user = {};

    this.authToken = null;
    this.totalComments = 0;
    this.currentPostHandleId = null;
    this.commentList = [];
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

  toggleCommentsInput(state) {
    let commentInputEle = $(this.TARGET_ELEMENT_ID).find(this.COMMENT_INPUT_ELEMENT_ID);
    return state ? commentInputEle.show() : commentInputEle.hide();
  }
  setAuthToken(token) {
    this.authToken = token;
    window.localStorage.setItem(this.LOCAL_STORAGE_TOKEN_KEY, token);
  }

  getAuthToken() {
    return window.localStorage.getItem(this.LOCAL_STORAGE_TOKEN_KEY);
  }

  clearAuthToken() {
    this.authToken = null;
    window.localStorage.clear();
  }

  isAdmin() {
    let currentDns = window.location.host.split('.').slice(-1)[0];
    if (!this.user.dns) {
      return;
    }
    return this.user.dns.indexOf(currentDns) !== -1;
  }
  getSelectedDns() {
    return $(this.DNS_LIST_ELEMENT_ID).val();
  }
  getCurrentPostId() {
    return window.location.host + '/' + window.location.pathname;
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
    return window.appendableData.post(this.authToken, handleId);
  }

  putAppendableData(handleId) {
    return window.appendableData.put(this.authToken, handleId);
  }

  dropAppendableDataHandle(handleId) {
    return window.appendableData.dropHandle(this.authToken, handleId);
  }

  putStructureData(handleId) {
    return window.structuredData.put(this.authToken, handleId);
  }

  dropStructuredDataHandle(handleId) {
    window.structuredData.dropHandle(this.authToken, handleId);
  }

  dropDataIdHandle(dataIdHandle) {
    window.dataId.dropHandle(this.authToken, dataIdHandle);
  }

  blockUser(index) {
    this.log('Block User');
    let signKeyHandleId = null;
    this.toggleSpinner(true);

    // drop signed key handle id
    const dropSignKeyHandle = () => {
      this.log('Drop signed key handle id');
      window.appendableData.dropSignKeyHandle(this.authToken, signKeyHandleId)
        .then((res) => {
          console.log(res);
          this.toggleSpinner(false);
        }, (err) => {
          console.log(err);
          this.errorHandler(err);
        });
    };

    // post appendable data to network
    const post = () => {
      this.log('Post appendable data');
      this.postAppendableData(this.currentPostHandleId)
        .then((res) => {
          console.log(res);
          dropSignKeyHandle();
        }, (err) => {
          console.error(err);
          this.errorHandler(err);
        });
    };

    const addFilter = () => {
      this.log('Add filter');
      window.appendableData.addToFilter(this.authToken, this.currentPostHandleId, [signKeyHandleId])
        .then((res) => {
          console.log(res);
          post();
        }, (err) => {
          console.error(err);
          this.errorHandler(err);
        });
    };

    // get appendable data signed key at index
    this.log('Get signed key at :: ' + index);
    window.appendableData.getSignKeyAt(this.authToken, this.currentPostHandleId, index)
      .then((res) => {
        signKeyHandleId = res.__parsedResponseBody__.handleId;
        addFilter();
      }, (err) => {
        console.error(err);
        this.errorHandler(err);
      });
  }

  deleteComment(ele, index) {
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
    const clearAllDeletedDatas = () => {
      this.log('Clear appendable deleted data');
      window.appendableData.clearAll(this.authToken, this.currentPostHandleId, true)
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
    window.appendableData.removeAt(this.authToken, this.currentPostHandleId, index)
      .then((res) => {
        this.postAppendableData(this.currentPostHandleId)
          .then((res) => {
            console.log(res);
            clearAllDeletedDatas();
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
      window.appendableData.append(this.authToken, this.currentPostHandleId, dataHandleId)
        .then((res) => {
          this.dropDataIdHandle();
          this.dropStructuredDataHandle(currentSDHandleId);
          this.resetCommentForm();
          this.toggleSpinner();
          this.fetchComments();
        }, (err) => {
          // handle error
          console.error(err);
          this.errorHandler(err);
        });
    };

    // get structured data data handler id
    const getSDDataHandleId = () => {
      this.log('Get structured data handle id');
      window.structuredData.getDataIdHandle(this.authToken, currentSDHandleId)
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
      window.structuredData.create(this.authToken, name, 501, payload)
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
          '<button class="btn btn-danger btn-xs" type="button" onclick="window.commentsTutorial.deleteComment(this, ::INDEX::)">Delete</button>' +
          '<button class="btn btn-warning btn-xs" type="button" onclick="window.commentsTutorial.blockUser(::INDEX::)">Block</button>' +
          '</div>';
      }

      template += '<hr></div>';
      template = template.replace(/::HEADING::/, comment.name)
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
      window.structuredData.readData(this.authToken, handleId)
        .then((res) => {
          this.commentList.unshift({
            index: currentIndex,
            data: res.__parsedResponseBody__
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
      window.structuredData.getHandle(this.authToken, dataHandleId)
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
      window.appendableData.getDataIdAt(this.authToken, this.currentPostHandleId, index)
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
      this.log('Iterate for index :: ' + currentIndex);
      fetchAppendableDataVal(currentIndex);
    };

    // get appendable data length
    const getAppendableDataLength = () => {
      this.log('Fetch appendable data length');
      window.appendableData.getMetadata(this.authToken, this.currentPostHandleId)
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

      window.appendableData.getHandle(this.authToken, dataHandleId)
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
    let ID = this.getCurrentPostId();
    window.dataId.getAppendableDataHandle(this.authToken, ID)
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
    let ID = this.getCurrentPostId();

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
      window.appendableData.create(this.authToken, ID, false)
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
        this.fetchComments();
      }, (err) => {
        console.error(err);
        this.errorHandler(err);
        this.clearAuthToken();
        if (err.message.indexOf('401 Unauthorized') !== -1) {
          return this.fetchComments();
        }
      });
  };

// authorise app
  authoriseApp() {
    this.log('Authorising application');
    window.safeAuth.authorise(this.app)
      .then((res) => {
        this.setAuthToken(res.__parsedResponseBody__.token);
        this.getDns();
      }, (err) => {
        console.error(err);
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
      '<option value="anonymous">Anonymous</option>' +
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
    $(window).on('beforeunload', () => (this.dropAppendableDataHandle(currentPostHandleId)));
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
  blockUser: (index) => {
    commentTutorial.blockUser(index);
  }
};
