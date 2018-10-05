const app = require('./code-snippets/app');
const auth = require('./code-snippets/auth');
const immutableData = require('./code-snippets/immutableData');
const mutableData = require('./code-snippets/mutableData');
const mutableDataEntries = require('./code-snippets/mutableDataEntries');
const mutableDataMutation = require('./code-snippets/mutableDataMutation');
const mutableDataPermissions = require('./code-snippets/mutableDataPermissions');
const nfs = require('./code-snippets/nfs');
const nfsFile = require('./code-snippets/nfsFile');
const cipherOpt = require('./code-snippets/cipherOpt');
const crypto = require('./code-snippets/crypto');
const cryptoEncKeyPair = require('./code-snippets/cryptoEncKeyPair');
const cryptoPubEncKey = require('./code-snippets/cryptoPubEncKey');
const cryptoSecEncKey = require('./code-snippets/cryptoSecEncKey');
const cryptoPubSignKey = require('./code-snippets/cryptoPubSignKey');
const cryptoSecSignKey = require('./code-snippets/cryptoSecSignKey');
const cryptoSignKeyPair = require('./code-snippets/cryptoSignKeyPair');
//let helpers = require('./code-snippets/helpers');

let codeSnippets = [
  app,
  auth,
  immutableData,
  mutableData,
  mutableDataEntries,
  mutableDataMutation,
  mutableDataPermissions,
  nfs,
  nfsFile,
  cipherOpt,
  crypto,
  cryptoEncKeyPair,
  cryptoPubEncKey,
  cryptoSecEncKey,
  cryptoPubSignKey,
  cryptoSecSignKey,
  cryptoSignKeyPair
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
    //fileInputEl.setAttribute('class', 'form-control');
    fileInputEl.setAttribute('id', 'dirExplorer');
    fileInputEl.setAttribute('webkitdirectory', '');
    fileInputEl.setAttribute('multiple', '');
    fileInputEl.setAttribute('allowDir', 'true');

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

  let titleEl = window.document.createElement('p');
  titleEl.setAttribute('data-toggle', 'collapse');
  titleEl.setAttribute('class', 'module-title text-normal-1');
  titleEl.setAttribute('data-target', '#'+moduleName);
  titleEl.innerText = moduleName;

  let moduleContainer = window.document.createElement('div');
  moduleContainer.setAttribute('class', 'collapse moduleContainer');
  moduleContainer.setAttribute('id', moduleName);

  window.document.getElementById('snippetParent').appendChild(titleEl);
  window.document.getElementById('snippetParent').appendChild(moduleContainer);

  Object.keys(module[moduleName]).map(function(key, i) {
    let anchorEl = window.document.createElement('a');
    anchorEl.setAttribute("onclick", "updateCode(window.snippets." + moduleName + "." + key  + ")");
    if (key  === 'initialiseApp') {
      anchorEl.setAttribute("class", "snippet bgcolor-blue-500");
    } else {
      anchorEl.setAttribute("class", "snippet");
    }
    anchorEl.setAttribute("id", i);
    anchorEl.addEventListener("click", (event) => {
      event.target.setAttribute("class", "snippet bgcolor-blue-500");
      const snippetArray = document.getElementsByClassName('snippet');
      Array.prototype.forEach.call(snippetArray, (snippet) => {
       if(event.target.id !== snippet.id) {
         snippet.setAttribute("class", "snippet"); 
       }
      });
    });
    anchorEl.innerText = key;
    moduleContainer.appendChild(anchorEl);
  });
});

let el = document.getElementById('code');
el.value = app.app.initialiseApp;

module.exports = {};
