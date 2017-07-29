let safeApp = require('./code-snippets/safeApp');
let safeImmutableData = require('./code-snippets/safeImmutableData');
let safeMutableData = require('./code-snippets/safeMutableData');
let safeMutableDataEntries = require('./code-snippets/safeMutableDataEntries');
let safeMutableDataKeys = require('./code-snippets/safeMutableDataKeys');
let safeMutableDataValues = require('./code-snippets/safeMutableDataValues');
let safeMutableDataMutation = require('./code-snippets/safeMutableDataMutation');
let safeMutableDataPermissions = require('./code-snippets/safeMutableDataPermissions');
let safeMutableDataPermissionsSet = require('./code-snippets/safeMutableDataPermissionsSet');
let safeNfs = require('./code-snippets/safeNfs');
let safeNfsFile = require('./code-snippets/safeNfsFile');
let safeCipherOpt = require('./code-snippets/safeCipherOpt');
let safeCrypto = require('./code-snippets/safeCrypto');
let safeCryptoKeyPair = require('./code-snippets/safeCryptoKeyPair');
let safeCryptoPubEncKey = require('./code-snippets/safeCryptoPubEncKey');
let safeCryptoSecEncKey = require('./code-snippets/safeCryptoSecEncKey');
let safeCryptoSignKey = require('./code-snippets/safeCryptoSignKey');
let helpers = require('./code-snippets/helpers');

let codeSnippets = [
  safeApp,
  safeImmutableData,
  safeMutableData,
  safeMutableDataEntries,
  safeMutableDataKeys,
  safeMutableDataValues,
  safeMutableDataMutation,
  safeMutableDataPermissions,
  safeMutableDataPermissionsSet,
  safeNfs,
  safeNfsFile,
  safeCipherOpt,
  safeCrypto,
  safeCryptoKeyPair,
  safeCryptoPubEncKey,
  safeCryptoSecEncKey,
  safeCryptoSignKey,
  helpers
];

function updateCode(string) {

  let regExNfsCreate = new RegExp('fileExplorer');
  let regExNfsUploadDirectory =  new RegExp('dirExplorer');

  if(regExNfsCreate.test(string)) {
    if(document.getElementById('fileExplorer')) {
      return;
    } else if(document.getElementById('dirExplorer')) {
      let childEl = document.getElementById('dirExplorer');
      let parentEl = document.getElementById('codeForm');
      parentEl.removeChild(childEl);
    } else {
      let fileInputEl = document.createElement('input');
      fileInputEl.setAttribute('type', 'file');
      fileInputEl.setAttribute('class', 'form-control');
      fileInputEl.setAttribute('id', 'fileExplorer');
      fileInputEl.setAttribute('value', ' file');

      let parentEl = document.getElementById('codeForm');
      let buttonEl = document.getElementById('runButton');

      parentEl.insertBefore(fileInputEl, buttonEl);
    }
  } else if (regExNfsUploadDirectory.test(string)) {

    if(document.getElementById('dirExplorer')) {
      return;
    } else if(document.getElementById('fileExplorer')) {
      let childEl = document.getElementById('fileExplorer');
      let parentEl = document.getElementById('codeForm');
      parentEl.removeChild(childEl);
    }

    let fileInputEl = document.createElement('input');
    fileInputEl.setAttribute('type', 'file');
    fileInputEl.setAttribute('class', 'form-control');
    fileInputEl.setAttribute('id', 'dirExplorer');
    fileInputEl.setAttribute('value', ' directory');
    fileInputEl.setAttribute('webkitdirectory', '');
    fileInputEl.setAttribute('directory', '');

    let parentEl = document.getElementById('codeForm');
    let buttonEl = document.getElementById('runButton');

    parentEl.insertBefore(fileInputEl, buttonEl);
  } else {
    if(document.getElementById('fileExplorer')) {
      let childEl = document.getElementById('fileExplorer');
      let parentEl = document.getElementById('codeForm');
      parentEl.removeChild(childEl);
    }

    if(document.getElementById('dirExplorer')) {
      let childEl = document.getElementById('dirExplorer');
      let parentEl = document.getElementById('codeForm');
      parentEl.removeChild(childEl);
    }
  }

  let el = document.getElementById('code');
  el.value = string;
  el.style.height = '0px';
  el.style.height = el.scrollHeight + 'px';
}

window.updateCode = updateCode;

window.snippets = {};

codeSnippets.map(function(module) {
  let moduleName = Object.keys(module)[0];

  Object.keys(module[moduleName]).map(function(key) {
    if(module[moduleName][key].__proto__ == Function.prototype) {
      module[moduleName][key] = module[moduleName][key].toString();
    }
  })

  window.snippets[moduleName] = Object.assign({}, module[moduleName]);

  let titleEl = window.document.createElement('h3');
  titleEl.setAttribute('data-toggle', 'collapse');
  titleEl.setAttribute('class', 'module-title');
  titleEl.setAttribute('data-target', '#'+moduleName);
  titleEl.innerText = moduleName;

  let moduleContainer = window.document.createElement('div');
  moduleContainer.setAttribute('class', 'collapse moduleContainer');
  moduleContainer.setAttribute('id', moduleName);

  window.document.getElementById('snippetParent').appendChild(titleEl);
  window.document.getElementById('snippetParent').appendChild(moduleContainer);

  Object.keys(module[moduleName]).map(function(key) {
    let anchorEl = window.document.createElement('a');
    anchorEl.setAttribute("onclick", "updateCode(window.snippets." + moduleName + "." + key  + ")");
    anchorEl.setAttribute("class", "snippet");
    anchorEl.innerText = key;
    moduleContainer.appendChild(anchorEl);
  });
});

let el = document.getElementById('code');
el.value = safeApp.safeApp.initialise;
el.style.height = el.scrollHeight + 'px';

module.exports = {};
