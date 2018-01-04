let safeApp = require('./code-snippets/safeApp');
let safeImmutableData = require('./code-snippets/safeImmutableData');
let safeMutableData = require('./code-snippets/safeMutableData');
let safeMutableDataEntries = require('./code-snippets/safeMutableDataEntries');
let safeMutableDataMutation = require('./code-snippets/safeMutableDataMutation');
let safeMutableDataPermissions = require('./code-snippets/safeMutableDataPermissions');
let safeNfs = require('./code-snippets/safeNfs');
let safeNfsFile = require('./code-snippets/safeNfsFile');
let safeCipherOpt = require('./code-snippets/safeCipherOpt');
let safeCrypto = require('./code-snippets/safeCrypto');
let safeCryptoEncKeyPair = require('./code-snippets/safeCryptoEncKeyPair');
let safeCryptoPubEncKey = require('./code-snippets/safeCryptoPubEncKey');
let safeCryptoSecEncKey = require('./code-snippets/safeCryptoSecEncKey');
let safeCryptoPubSignKey = require('./code-snippets/safeCryptoPubSignKey');
let safeCryptoSecSignKey = require('./code-snippets/safeCryptoSecSignKey');
let safeCryptoSignKeyPair = require('./code-snippets/safeCryptoSignKeyPair');
// let helpers = require('./code-snippets/helpers');

let codeSnippets = [
  safeApp,
  safeImmutableData,
  safeMutableData,
  safeMutableDataEntries,
  safeMutableDataMutation,
  safeMutableDataPermissions,
  safeNfs,
  safeNfsFile,
  safeCipherOpt,
  safeCrypto,
  safeCryptoEncKeyPair,
  safeCryptoPubEncKey,
  safeCryptoSecEncKey,
  safeCryptoPubSignKey,
  safeCryptoSecSignKey,
  safeCryptoSignKeyPair
//  helpers
];

function updateCode(string) {

  let regExNfsCreate = new RegExp('fileContent');
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

      fileInputEl.addEventListener('change', function(event) {

        let fileReader = new FileReader();

        fileReader.onload = function(event) {
          let fileBuffer = new Buffer(event.target.result);
          window.fileContent = fileBuffer;
        }

        fileReader.readAsArrayBuffer(event.target.files[0]);
      });

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

  editor.getDoc().setValue(string.toString());
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

  let titleEl = window.document.createElement('h5');
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

module.exports = {};
