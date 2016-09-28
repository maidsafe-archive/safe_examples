const LOCAL_STORAGE_TOKEN_KEY = 'SAFE_TOKEN';
const app = {
  name: "Safe Blog",
  id: "blog.maidsafe.net",
  version: "0.0.1",
  vendor: "maidsafe",
  permissions: [
    'SAFE_DRIVE_ACCESS',
    'LOW_LEVEL_API'
  ]
};

const SD_ENCRYPTION = {
  NONE: 'NONE',
  SYMMETRIC: 'SYMMETRIC',
  HYBRID: 'HYBRID'
};

let DEST_ELEMENT_ID = null;
const TARGET_ELEMENT_ID = '#_commets'; // prefix with #
const COMMENT_ENABLE_BTN_ELEMENT_ID = '#_commentEnable'; // prefix with #
const COMMENT_LIST_ELEMENT_ID = '#_commentList'; // prefix with #
const COMMET_TEXT_ELEMENT_ID = '#_commentText'; // prefix with #
const COMMET_FORM_ELEMENT_ID = '#_commentForm'; // prefix with #
const COMMENT_INPUT_ELEMENT_ID = '#_commentInput'; // prefix with #
const DNS_LIST_ELEMENT_ID = '#_dnsList'; // prefix with #
const COMMENT_SPINNER_ELEMENT_ID = '#_commentSpinner'; // prefix with #
const user = {};

const APP_FLOW = [
  'authoriseApp'
];

var authToken = null;
var totalComments = 0;
var currentPostHandleId = null;
var commentList = [];
window.isAdmin = false;

// utility functions
var utils = {
  toggleEnableCommentBtn: function(status) {
    var commentEnableEle = $(TARGET_ELEMENT_ID).children(COMMENT_ENABLE_BTN_ELEMENT_ID);
    return status ? commentEnableEle.show() : commentEnableEle.hide();
  },
  toggleComments: function(status) {
    var commentsEle = $(TARGET_ELEMENT_ID).children(COMMENT_LIST_ELEMENT_ID);
    return status ? commentsEle.show() : commentsEle.hide();
  },
  toggleCommentsInput: function(state) {
    var commentInputEle = $(TARGET_ELEMENT_ID).find(COMMENT_INPUT_ELEMENT_ID);
    return state ? commentInputEle.show() : commentInputEle.hide();
  },
  setAuthToken: function(token) {
    authToken = token;
    window.localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
  },
  getAuthToken: function() {
    return window.localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
  },
  isAdmin: function() {
    var currentDns = window.location.host.split('.').slice(-1)[0];
    if (!user.dns) {
      return;
    }
    return user.dns.indexOf(currentDns) !== -1;
  },
  getSelectedDns: function() {
    return $(DNS_LIST_ELEMENT_ID).val();
  },
  getCurrentPostId: function() {
    return window.location.host + '/' + window.location.pathname;
  },
  generateRandomString: function() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for( var i=0; i < 5; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },
  clearComments: function() {
    $(TARGET_ELEMENT_ID).children(COMMENT_LIST_ELEMENT_ID).children('.media').remove();
  },
  resetCommentForm: function() {
    $(COMMET_FORM_ELEMENT_ID)[0].reset();
  },
  toggleSpinner: function(state) {
    var spinnerEle = $(COMMENT_SPINNER_ELEMENT_ID);
    return state ? spinnerEle.show() : spinnerEle.hide();
  }
};

var log = function(str) {
  console.log((new Date()).toLocaleString() + ' :: ' + str);
};

var handleErrorInCommon = function() {
  utils.toggleSpinner();
};

var postAppendableData = function(handlerId) {
  return window.appendableData.post(authToken, handlerId);
};

var putAppendableData = function(handlerId) {
  return window.appendableData.put(authToken, handlerId);
};

var dropAppendableDataHandler = function(handlerId) {
  return window.appendableData.dropHandle(authToken, handlerId);
};

var putStructureData = function(handlerId) {
  return window.structuredData.put(authToken, handlerId);
};

var blockUser = function(index) {
  log('Block User');
  var signedKeyhandleId = null;
  utils.toggleSpinner(true);

  // drop signed key handle id
  var dropSignedKeyHandle = function() {
    log('Drop signed key handle id');
    window.appendableData.dropSignKeyHandle(authToken, signedKeyhandleId)
    .then(function(res) {
      console.log(res);
      utils.toggleSpinner(true);
    }, function(err) {
      console.log(err);
      handleErrorInCommon(err);
    });
  };

  // post appendable data to network
  var post = function() {
    log('Post appendable data');
    postAppendableData(currentPostHandleId)
    .then(function(res) {
      console.log(res);
      dropSignedKeyHandle();
    }, function(err) {
      console.error(err);
      handleErrorInCommon(err);
    });
  };

  // add filter
  var addFilter = function() {
    log('Add filter');
    window.appendableData.addToFilter(authToken, currentPostHandleId, [signedKeyhandleId])
    .then(function(res) {
      console.log(res);
      post();
    }, function(err) {
      console.error(err);
      handleErrorInCommon(err);
    });
  };

  // get appendable data signed key at index
  var getSignKey = function() {
    log('Get signed key at :: ' + index);
    window.appendableData.getSignKeyAt(authToken, currentPostHandleId, index)
    .then(function(res) {
      signedKeyhandleId = res.__parsedResponseBody__.handleId;
      addFilter();
    }, function(err) {
      console.error(err);
      handleErrorInCommon(err);
    });
  };

  getSignKey();
};

// delete comment
var deleteComment = function(ele, index) {
  log('Delete comment');
  if (typeof index == 'undefined') {
    return;
  }
  utils.toggleSpinner(true);

  // post data to network after delete
  var post = function() {
    log('Post appendable data');
    postAppendableData(currentPostHandleId)
    .then(function(res) {
      console.log(res);
      utils.clearComments();
      utils.toggleSpinner(false);
      fetchComments();
    }, function(err) {
      console.error(err);
      handleErrorInCommon(err);
    });
  };

  // clear all deleted data from appendable data
  var clearAllDeletedDatas = function() {
    log('Clear appendable deleted datas');
    window.appendableData.clearAll(authToken, currentPostHandleId, true)
    .then(function(res) {
      post();
      console.log(res);
    }, function(err) {
      console.error(err);
      handleErrorInCommon(err);
    });
  };

  // remove appendable data at index
  var removeAppendableDataAt = function() {
    log('Remove appendable data at :: ' + index);
    window.appendableData.removeAt(authToken, currentPostHandleId, index)
    .then(function(res) {
      postAppendableData(currentPostHandleId)
      .then(function(res) {
        console.log(res);
        clearAllDeletedDatas();
      }, function(err) {
        console.error(err);
      });
    }, function(err) {
      console.error(err);
      handleErrorInCommon(err);
    });
  };

  removeAppendableDataAt();
};

// write new comment
var writeComment = function(e) {
  log('Write comments');
  utils.toggleSpinner(true);

  var currentSDHandleId = null;
  var content = $(COMMET_TEXT_ELEMENT_ID).val();
  var publicName = utils.getSelectedDns();
  var timeStamp = (new Date()).getTime();
  var name = publicName + timeStamp + utils.generateRandomString();
  var payload = {
    name: publicName,
    comment: content,
    time: timeStamp
  };
  payload = new Buffer(JSON.stringify(payload)).toString('base64');

  // drop structured data data handle id
  var dropStructureDataHandler = function(handlerId) {
    log('Drop structured data handle id');
    window.structuredData.dropHandle(authToken, handlerId)
      .then(function(res) {
        console.log(res);
      }, function(err) {
        console.error(err);
      });
  };

  // append structured data data handle id to appendable data
  var appendToAppendableData = function(dataHandleId) {
    log('Append structured data handle id');
    window.appendableData.append(authToken, currentPostHandleId, dataHandleId)
    .then(function(res) {
      dropStructureDataHandler(dataHandleId);
      utils.resetCommentForm();
      utils.toggleSpinner();
      fetchComments();
    }, function(err) {
      // handle error
      console.error(err);
      handleErrorInCommon(err);
    });
  };

  // get structured data data handler id
  var getSDDataHandleId = function() {
    log('Get structured data handle id');
    window.structuredData.getDataIdHandle(authToken, currentSDHandleId)
    .then(function(res) {
      appendToAppendableData(res.__parsedResponseBody__.handleId);
    }, function(err) {
      console.error(err);
      handleErrorInCommon(err);
    });
  };

  // put structured data to network
  var put = function() {
    log('Put structured data');
    putStructureData(currentSDHandleId)
    .then(function(res) {
      getSDDataHandleId();
    }, function(err) {
      console.error(err);
      handleErrorInCommon(err);
    });
  };

  // create new structured data
  var createStructureData = function() {
    log('Create structured data');
    window.structuredData.create(authToken, name, 501, payload)
    .then(function(res) {
      currentSDHandleId = res.__parsedResponseBody__.handleId;
      put();
    }, function(err) {
      // handle error
      console.error(err);
      handleErrorInCommon(err);
    });
  };
  createStructureData();
};

// fetch comments
var fetchComments = function() {
  log('Fetch comments');
  var currentIndex = 0;
  commentList = [];

  utils.toggleSpinner(true);

  // prepare comment template
  var prepareTemplate = function(comment, index) {
    var template = '<div class="media">' +
        '<div class="media-body">' +
            '<h4 class="media-heading">::HEADING::' +
                '<small>::DATE_TIME::</small>' +
            '</h4>' +
            '::CONTENT::' +
        '</div>';

    if (utils.isAdmin()) {
      template += '<div class="media-options">' +
        '<button class="btn btn-danger btn-xs" type="button" onclick="window.deleteComment(this, ::INDEX::)">Delete</button>' +
        '<button class="btn btn-warning btn-xs" type="button" onclick="window.blockUser(::INDEX::)">Block</button>' +
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
  var addComment = function() {
    utils.clearComments();
    commentList.sort(function(a, b) {
      return new Date(b.data.time) - new Date(a.data.time);
    });
    commentList.forEach(function(comment) {
      var template = prepareTemplate(comment.data, comment.index);
      $(TARGET_ELEMENT_ID).children(COMMENT_LIST_ELEMENT_ID).append(template);
    });
  };

  // get structured data
  var getStructureData = function(handleId) {
    log('Fetch structured data');
    console.log('handle id :: ', handleId);
    window.structuredData.readData(authToken, handleId)
    .then(function(res) {
      commentList.unshift({
        index: currentIndex,
        data: res.__parsedResponseBody__
      });
      commentsIterator();
    }, function(err) {
      console.error(err);
      handleErrorInCommon(err);
    });
  };

  // drop data Id handle
  var dropDataIdHandle = function(dataHandleId) {
    window.dataId.dropHandle(authToken, dataHandleId)
    .then(function(res) {
      console.log(res);
    }, function(err) {
      console.error(err);
      handleErrorInCommon(err);
    });
  }

  // get structured data handle
  var getStructureDataHandle = function(dataHandleId) {
    window.structuredData.getHandle(authToken, dataHandleId)
    .then(function(res) {
      dropDataIdHandle(dataHandleId);
      getStructureData(res.__parsedResponseBody__.handleId);
    }, function(err) {
      console.error(err);
      handleErrorInCommon(err);
    });
  };

  // fetch appendable data at index
  var fetchAppendableDataVal = function(index) {
    log('Fetch appendable data value for index :: ' + index);
    window.appendableData.getDataIdAt(authToken, currentPostHandleId, index)
    .then(function(res) {
      return getStructureDataHandle(res.__parsedResponseBody__.handleId);
    }, function(err) {
      console.error(err);
      handleErrorInCommon(err);
    });
  };

  // iterate comment
  var commentsIterator = function() {
    currentIndex = commentList.length % (totalComments + 1);
    if (totalComments === 0 || (currentIndex === totalComments)) {
      addComment();
      return utils.toggleSpinner();
    }
    log('Iterate for index :: ' + currentIndex);
    fetchAppendableDataVal(currentIndex);
  };

  // get appendable data length
  var getAppenableDataLength = function() {
    log('Fetch appendable data length');
    window.appendableData.getMetadata(authToken, currentPostHandleId)
    .then(function(res) {
      totalComments = res.__parsedResponseBody__.dataLength;
      commentsIterator();
    }, function(err) {
      // handle error
      console.error(err);
      handleErrorInCommon(err);
    });
  };

  dropAppendableDataDataHandle = function(dataHandleId) {
    window.dataId.dropHandle(authToken, dataHandleId)
    .then(function(res) {
      console.log(res);
      getAppenableDataLength();
    }, function(err) {
      handleErrorInCommon(err);
      console.error(err);
    });
  }

  // fetch appendableData
  var fetchAppendableData = function(dataHandleId) {
    log('Fetch appendable data');

    window.appendableData.getHandle(authToken, dataHandleId)
      .then(function(res) {
        utils.toggleComments(true);
        utils.toggleCommentsInput(!!authToken);
        currentPostHandleId = res.__parsedResponseBody__.handleId;
        dropAppendableDataDataHandle(dataHandleId);
      }, function(err) {
        // handle error
        console.error(err);
        handleErrorInCommon(err);
        if (utils.isAdmin()) {
          utils.toggleEnableCommentBtn(true);
        }
      });
  };

  var getAppendableDataDataHandle = function() {
    log('Fetch appendable data data handle id');
    var ID = utils.getCurrentPostId();
    window.dataId.getAppendableDataHandle(authToken, ID)
    .then(function(res) {
      console.log(res);
      fetchAppendableData(res.__parsedResponseBody__.handleId);
    }, function(err) {
      handleErrorInCommon(err);
      console.error(err);
    });
  };

  getAppendableDataDataHandle();
};

// enable comment by admin
var enableComments = function() {
  if (!utils.isAdmin()) {
    return console.error('Admin has the privilege to enable comment');
  }
  utils.toggleSpinner(true);
  log('Enable Comment');
  var ID = utils.getCurrentPostId();

  var put = function(handleId) {
    log('Put appendable data');
    putAppendableData(handleId)
    .then(function(res) {
      utils.toggleEnableCommentBtn(false);
      utils.toggleComments(true);
      currentPostHandleId = handleId;
      utils.toggleSpinner(false);
    }, function(err) {
      console.error(err);
      handleErrorInCommon(err);
    });
  };

  // create appendable data
  var createAppendableData = function() {
    log('Create appendable data');
    window.appendableData.create(authToken, ID, false)
    .then(function(res) {
      put(res.__parsedResponseBody__.handleId);
    }, function(err) {
      // hanle error
      handleErrorInCommon(err);
      console.error(err);
    });
  };

  createAppendableData();
};

var addDnsList = function() {
  if (!user.dns) {
    return;
  }
  user.dns.forEach(function(list, i) {
    var option = '<option value="' + list + '" ' + (i === 0 ? ' selected' : '') + '>' + list + '</option>';
    $(DNS_LIST_ELEMENT_ID).prepend(option);
  });
};

// get longNames list
var getDns = function() {
  log('Fetching DNS records');
  window.safeDNS.getDns(authToken)
  .then(function(res) {
    user.dns = res.__parsedResponseBody__;
    addDnsList();
    fetchComments();
  }, function(err) {
    // hanle error
    console.error(err);
    handleErrorInCommon(err);
    if (err.message.indexOf('401 Unauthorized') !== -1) {
      return fetchComments();
    }
  });
};

// authorise app
var authoriseApp = function() {
  log('Authorising application');
  window.safeAuth.authorise(app)
  .then(function(res) {
    utils.setAuthToken(res.__parsedResponseBody__.token);
    getDns();
  }, function(err) {
    console.error(err);
    handleErrorInCommon(err);
    return fetchComments();
  });
};

// load initial structure
var loadInitialTemplpate = function() {
  if (!TARGET_ELEMENT_ID) {
    throw new Error('Target not found');
  }
  var initialTemplate = '<div class="comment-block center-block">' +
    '<div class="comment-spinner" id="_commentSpinner">' +
      '<div class="comment-spinner-b">' +
        '<i class="spinner glyphicon glyphicon-repeat" aria-hidden="true"></i>' +
      '</div>' +
    '</div>' +
    '<div id="_commets">' +
      '<div id="_commentEnable" class="comment-enable">' +
        '<div class="panel panel-default">' +
          '<div class="panel-body">' +
            '<button class="btn btn-primary" type="enableComments" onclick="window.enableComments()">Enable Comments</button>' +
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
                '<button type="button" class="btn btn-primary" onclick="window.writeComment()">Submit</button>' +
            '</form>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
  $(DEST_ELEMENT_ID).html(initialTemplate);
};

// starting point
var run = function() {
  loadInitialTemplpate();
  utils.toggleSpinner(true);
  authToken = utils.getAuthToken();
  if (!authToken) {
    authoriseApp();
  } else {
    getDns();
  }
};

window.Comment = function(targetId) {
  DEST_ELEMENT_ID = targetId ? targetId : '#comments';
  run();
};

$(window).unload(function() {
  dropAppendableDataHandler(currentPostHandleId)
  .then(function(res) {
    console.log(res);
  }, function(err) {
    console.error(err);
  });
});
