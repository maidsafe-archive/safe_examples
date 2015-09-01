// Electron UI Variable initialization
var remote = require('remote');
var Menu = remote.require('menu');
var shell = remote.require('shell');
var dialog = remote.require('dialog');

// Nodejs and Application Variable initialization
var path = require('path');
var mime = require('mime');
var fs = require('fs');
var appSrcFolderPath = (__dirname.indexOf('asar') === -1) ? path.resolve('src') : path.resolve(__dirname, '../../src/');
var Uploader = require('../scripts/uploader');
var serviceName;
var publicName;
var tempBackgroundFilePath;
// Registering Jquery - Electron Way
window.$ = window.jQuery = require('../scripts/jquery.js');
// Disable Menu bar
Menu.setApplicationMenu(null);

// Navigation States
var AppNavigator = {
  current: '',
  states: {
    'step-2': 'step-1',
    'template': 'step-2'
  },
  onBack: {
    'template': function() {
      resetTemplate()
    }
  },
  onLoad: {
    'step-2': function() {
      $('nav div.title').html('safe:' + serviceName + '.' + publicName);
    },
    'template': function() {
      resetTemplate()
    }
  },
  visibleOn: ['step-2', 'template'],
  showPublish: ['template'],
  ui: {
    nav: null,
    backElement: null,
    titleElement: null,
    publishElement: null
  },
  update: function(id) {
    this.current = id;
    if (this.visibleOn.indexOf(this.current) === -1) {
      this.ui.nav.hide();
      return;
    }
    if (this.showPublish.indexOf(this.current) > -1) {
      this.ui.publishElement.show();
    } else {
      this.ui.publishElement.hide();
    }
    this.ui.nav.show();
    if (this.onLoad[this.current]) {
      this.onLoad[this.current]();
    }
  },
  back: function() {
    if (this.onBack[this.current]) {
      this.onBack[this.current]();
    }
    showSection(this.states[this.current]);
  },
  init: function(initialState) {
    this.ui.nav = $('nav');
    this.ui.backElement = $('nav div.back');
    this.ui.titleElement = $('nav div.title');
    this.ui.publishElement = $('nav div.publish');
    this.update(initialState);
  }
};

var goBack = function() {
  AppNavigator.back();
};

var openExternal = function(url) {
  shell.openExternal(url);
};

/**
 * Display error below the input field
 */
var showError = function(id, msg) {
  var pos = $('#' + id).offset();
  var errorElement = $('.error');
  errorElement.css('top', pos.top + 40 + 'px');
  errorElement.css('left', pos.left + 'px');
  errorElement.css('display', 'block');
  $('.error-msg').html(msg);
  setTimeout(function() {
    $('.error').css('display', 'none');
  }, 3000);
};

/**
 * Validates service name and public name
 * @returns {boolean}
 */
var validate = function() {
  var serviceNameElement = document.getElementById('service_name');
  var publicNameElement = document.getElementById('public_name');
  if (serviceNameElement.checkValidity() && publicNameElement.checkValidity() && publicNameElement.value.indexOf('.') === -1) {
    return true;
  } else if(!serviceNameElement.checkValidity()) {
    showError('service_name', 'Service Name cannot be empty');
  } else if(!publicNameElement.checkValidity()) {
    showError('public_name', 'Public Name cannot be empty');
  } else if (publicNameElement.value.indexOf('.') > -1) {
    showError('public_name', 'Public Name cannot contain "."');
  }
  return false;
};

/**
 * Clears the Publicname and service Name fields
 */
var clearServiceAndPublicName = function() {
  $('#service_name').val('');
  $('#public_name').val('');
};

/**
 * Invoked on clicking the Upload files button.
 * Validates the input and moves to the next section
 */
var validateInput = function() {
  if(!validate()) {
    return;
  }
  serviceName = $('#service_name').val();
  publicName = $('#public_name').val();
  showSection('step-2');
  clearServiceAndPublicName();
};

/**
 * Shows the section corresponding to the id.
 * @param id
 */
var showSection = function(id) {
  var tmp;
  var hideClass = 'hide';
  var sections = [];
  $('section').map(function(i, e) {
    sections.push(e.getAttribute('id'));
  });
  for (var i in sections) {
    if (sections[i] === id) {
      $('#' + sections[i]).removeClass(hideClass);
      continue;
    }
    tmp = $('#' + sections[i]);
    if (!tmp.hasClass(hideClass)) {
      tmp.addClass(hideClass);
    }
  };
  AppNavigator.update(id);
};


/**
 *  Dragover and drop is disabled on document.
 *  Read > https://github.com/nwjs/nw.js/issues/219
 */
document.addEventListener('dragover', function(e){
  e.preventDefault();
  e.stopPropagation();
}, false);

document.addEventListener('drop', function(e){
  e.preventDefault();
  e.stopPropagation();
}, false);

/** Uploader Callback - when the upload starts **/
var onUploadStarted = function() {
  showSection('step-3');
};
/** Uploader Callback - Updating progress bar **/
var updateProgressBar = function(meter) {
  $('.indicator div.meter').css('width', meter + '%');
};
/** Uploader Callback - when the upload is completed **/
var onUploadComplete = function(errorCode) {
  showSection(errorCode ? 'failure': 'success');
  if (!errorCode) {
    var endPoint = 'safe:' +  serviceName + '.' + publicName;
    $('#success_msg').html('Files Uploaded to <a onclick="openExternal(\'' + endPoint + '\')">' + endPoint + '</a>');
    return;
  }
  var reason;
  switch (errorCode) {
    case -1001:
      reason = 'Service Name and Public Name Already Registered';
      break;

    default:
      reason = "Oops! Something went wrong";
  }
  $('#error_msg').html(reason);
};

/**
 * Invoked to register the Drag and Drop Region
 * @param id - to enable drag and drop of files
 */
var registerDragRegion = function(id) {
  var helper;
  var holder;
  holder = document.getElementById(id);
  holder.ondragover = function () { this.className = 'hover'; return false; };
  holder.ondragleave = function () { this.className = ''; return false; };
  holder.ondrop = function (e) {
    e.preventDefault();
    if (e.dataTransfer.files.length === 0) {
      return false;
    }
    helper = new Uploader(onUploadStarted, updateProgressBar, onUploadComplete);
    helper.uploadFolder(serviceName, publicName, e.dataTransfer.files[0].path);
    return false;
  };
};

var getTemplateBackgroundFile = function() {
  var backgroundFile;
  if (tempBackgroundFilePath) {
    backgroundFile = { 'name' : path.basename(tempBackgroundFilePath), 'path': tempBackgroundFilePath };
  } else {
    backgroundFile = { 'name': 'bg.jpg', 'path': 'imgs/dns_bg.jpg'};
  }
  tempBackgroundFilePath = '';
  return backgroundFile;
};

/**
 * The template is generated from the `/views/template` by replacing the the edited title and description.
 * The dependencies for the page such as normalize.css and bg.jpg are copied along with the genarted template to a temp Directory.
 * The temp directory is finally passed for Uploading to the network
 */
var publishTemplate = function() {
  var temp = require('temp').track();
  var fs = require('fs');
  var util = require('util');

  var tempDirName = 'safe_uploader_template';
  var title = $('#template_title_input').val();
  var content = $('#template_content_input').val();
  var templateDependencies = {
    'normalize.css': 'bower_components/bower-foundation5/css/normalize.css'
    //'foundation.css': 'bower_components/bower-foundation5/css/foundation.css'
  };

  try {
    var tempDirPath = temp.mkdirSync(tempDirName);

    // Save the template in the temp Directory
    var templateString = fs.readFileSync(path.resolve(appSrcFolderPath, 'views/template.html')).toString();
    var backgroundImage = getTemplateBackgroundFile();
    templateDependencies[backgroundImage.name] = backgroundImage.path;
    templateString = templateString.replace(/BG_IMG/g, backgroundImage.name);
    fs.writeFileSync(path.resolve(tempDirPath, 'index.html'),
        util.format(templateString.replace(/SAFE_SERVICE/g, serviceName).replace(/SAFE_PUBLIC/g, publicName), title, content));
    // Save the template dependencies
    var buff;
    for (var key in templateDependencies) {
      buff = fs.readFileSync(path.resolve(appSrcFolderPath, templateDependencies[key]));
      fs.writeFileSync(path.resolve(tempDirPath, key), buff);
    }
    //// Values edited in the template are reset to defaults
    resetTemplate();
    //// Start upload
    var helper = new Uploader(onUploadStarted, updateProgressBar, onUploadComplete);
    helper.uploadFolder(serviceName, publicName, tempDirPath);
  } catch(e) {
    console.log(e.message);
    showSection('failure');
  }
};

/**** Template Updation functions *****/
var toggleDisplay = function(elementIdToHide, elementIdToShow) {
  $('#' + elementIdToHide).addClass('hide');
  $('#' + elementIdToShow).removeClass('hide');
};

$('#template_title_input').keypress(function(e) {
  if (e.which === 13) {
    toggleDisplay('edit_template_title', 'template_title');
  }
});

var editTemplateTitle = function(e) {
  toggleDisplay('template_title', 'edit_template_title');
  $('#template_title_input').focus();
  e.stopPropagation();
};

var updateTemplateTitle = function(value) {
  $('#template_title').html(value);
};
$('#template_content_input').keypress(function(e) {
  if (e.which === 13) {
    toggleDisplay('edit_template_content', 'template_content');
  }
});
$('#template_content_input').focusout(function() {
  toggleDisplay('edit_template_content', 'template_content');
});

var editTemplateContent = function() {
  toggleDisplay('template_content', 'edit_template_content');
  $('#template_content_input').focus();
};

var updateTemplateContent = function(value) {
  $('#template_content').html(value);
};

var updateTemplateContent = function(value) {
  $('#template_content').html(value);
};

var resetTemplate = function() {
  $('#template_title').html("My Page");
  $('#template_title_input').val("My Page");
  $('#template_content').html("This page is created and published on the SAFE Network using the SAFE Uploader");
  $('#template_content_input').val("This page is created and published on the SAFE Network using the SAFE Uploader");
  var element = $('.template_banner');
  element.css('background', 'url(../imgs/dns_bg.jpg)');
  element.css('background-size', 'cover');
  element.css('background-position', 'center');
};

var onFileSelected = function(filePath) {
  if (!filePath) {
    return;
  }
  filePath = filePath[0];
  var mimeType = mime.lookup(path.basename(filePath));
  tempBackgroundFilePath = filePath;
  var element = $('.template_banner');
  element.css('background', 'url(data:' + mimeType +';base64,' + fs.readFileSync(filePath).toString('base64') + ')');
  element.css('background-size', 'cover');
  element.css('background-position', 'center');
};

var pickFile = function() {
  if($('#template_title').hasClass('hide')) {
    toggleDisplay('edit_template_title', 'template_title');
    return;
  }
  dialog.showOpenDialog({
    title: 'Select Image',
    filters: [
      { name: 'Images', extensions: ['jpg', 'png'] },
    ]
  }, onFileSelected)
};

/*****  Initialisation ***********/
AppNavigator.init('step-1');
registerDragRegion('drag_drop');
$('#service_name').focus();
