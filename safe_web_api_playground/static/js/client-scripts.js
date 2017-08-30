let initSnippets = require('./init_snippets.js');

let apiVariables = [
  'appHandle',
  'authUri',
  'permsHandle',
  'idReaderHandle',
  'idWriterHandle',
  'mdHandle',
  'valuesHandle',
  'keysHandle',
  'entriesHandle',
  'mutationHandle',
  'nfsHandle',
  'cipherOptHandle',
  'nonce',
  'permSetHandle',
  'encryptedKey',
  'encryptedValue',
  'signKeyHandle',
  'version',
  'fileContextHandle ',
  'pubEncKeyHandle',
  'keyPairHandle',
  'rawSignKey',
  'rawPubEncKey',
  'rawSecEncKey',
  'secEncKeyHandle',
  'encryptedBuffer',
  'idAddress',
  'serializedMD',
  'hashedString',
  'mdName'
];

function updateVariableValues() {
  return apiVariables.map(variable => {
    try {
      if(eval(variable)) {
        if(document.getElementById('tempText')) {
          let tempText = document.getElementById('tempText');
          tempText.parentNode.removeChild(tempText);
        }

        let varBoxEl = document.getElementById('variables');
        if(document.getElementById(variable)) {
          let pEl = document.getElementById(variable);
          let currentTextContent = pEl.textContent;

          pEl.textContent = '';
          let spanEl = document.createElement('span');
          spanEl.setAttribute('class', 'varName');
          spanEl.textContent = variable + ': ';
          pEl.appendChild(spanEl);

          let textNodeEl = document.createTextNode(eval(variable));

          pEl.appendChild(textNodeEl);

          let regexObject = new RegExp(eval(variable));

          if(!(regexObject.test(currentTextContent))) {
              pEl.setAttribute('class', 'flash');
          }

          varBoxEl.appendChild(pEl);
        } else {
          let pEl = document.createElement('p');
          pEl.setAttribute('id', variable);
          pEl.setAttribute('class', 'varValue');
          let spanEl = document.createElement('span');
          spanEl.setAttribute('class', 'varName');
          spanEl.textContent = variable + ': ';
          pEl.appendChild(spanEl);

          let textNodeEl = document.createTextNode(eval(variable));

          pEl.appendChild(textNodeEl);
          pEl.setAttribute('class', 'flash');
          varBoxEl.appendChild(pEl);
        }
      } else {
        let targetEl = document.getElementById(variable);
        targetEl.parentNode.removeChild(targetEl);

        let varBox = document.getElementById('variables');

        if(varBox.children.length == 1) {
          let italicEl = document.createElement('i');
          italicEl.textContent = 'No variables saved yet.';
          let pEl = document.createElement('p');
          pEl.setAttribute('id', 'tempText');
          pEl.appendChild(italicEl);
          varBox.appendChild(pEl);
        }
      }
    } catch (e) {
      return;
    }
  });
}

function handleSubmit() {
  if(document.getElementById('loader')) {
    document.getElementById('loader').parentNode.removeChild(document.getElementById('loader'));
  }
  let loader = document.createElement('div');
  loader.setAttribute('id', 'loader');
  document.getElementById('rightside').appendChild(loader);

  let el = document.getElementById('code');
  try {
    let res = eval(el.value);
    let isFreeSyncFunction = new RegExp('free').test(el.value);
    if(isFreeSyncFunction) {
      loader.parentNode.removeChild(loader);
      res();
      updateVariableValues();
      return;
    }
    return res().then(res => {
      loader.parentNode.removeChild(loader);
      console.log(res);

      updateVariableValues();

      if(/Setup Incomplete/.test(res)) {
        let div = document.createElement('div');
        div.setAttribute("class", "red-box output");
        let p1 = document.createElement('p');
        let p2 = document.createElement('p');
        let p3 = document.createElement('p');
        let p4 = document.createElement('p');
        let p5 = document.createElement('p');
        p1.textContent = 'Your app token is not yet authorised to perform this operation.';
        p2.textContent = '- First run safeApp.initialise';
        p3.textContent = '- Then run safeApp.authorise';
        p4.textContent = '- Finally, run safeApp.connectAuthorised';
        p5.textContent = 'Your appHandle will then be authorised to perform this operation!';
        div.appendChild(p1);
        let pElArray = [p1, p2, p3, p4, p5];
        pElArray.map(function(p) {
          div.appendChild(p);
        })

        let parentEl = document.getElementById('codebox');
        if(parentEl.children.length == 1) {
          parentEl.appendChild(div);
        } else {
          let parentChildren = parentEl.children;
          parentEl.insertBefore(div, parentChildren[1]);
        }
      } else {
        let div = document.createElement('div');
        div.setAttribute("class", "box output");
        let pEl = document.createElement('p');
        pEl.textContent = res;
        div.appendChild(pEl);

        let parentEl = document.getElementById('codebox');
        if(parentEl.children.length == 1) {
          parentEl.appendChild(div);
        } else {
          let parentChildren = parentEl.children;
          parentEl.insertBefore(div, parentChildren[1]);
        }
      }

    })
  } catch (e) {

    console.log(e.message);

    let errorType = apiVariables.find(function(string) {
        let regex = new RegExp(string);
       return regex.test(e.message);
    });


    let errorMessage = (function(type) {
      switch(type) {
        case 'valuesHandle':
          return 'valuesHandle not yet defined. Use safeMutableData.getValues to first obtain valuesHandle';
          break;

        case 'keysHandle':
          return 'keysHandle not yet defined. Use safeMutableData.getKeys to first obtain keysHandle';
          break;

        case 'entriesHandle':
          return 'entriesHandle not yet defined. Use safeMutableData.getEntries or .newEntries to first obtain entriesHandle';
          break;

        case 'mutationHandle':
          return 'mutationHandle not yet defined. Use safeMutableData.newMutation to first obtain mutationHandle';
          break;

        case 'permsHandle':
          return 'permsHandle not yet defined. Use safeMutableData.getPermissions to first obtain permsHandle';
          break;

        case 'nfsHandle':
          return 'nfsHandle not yet defined. Use safeMutableData.emulateAs to first obtain nfsHandle';
          break;

        case 'idWriterHandle':
          return 'idWriterHandle not yet defined. Use safeImmutableData.create to first obtain idWriterHandle';
          break;

        case 'idReaderHandle':
          return 'idReaderHandle not yet defined. Use safeImmutableData.fetch to first obtain idReaderHandle';
          break;

        case 'mdHandle':
          return 'mdHandle not yet defined. Use one of the first 4 functions from the safeMutableData module to first obtain mdHandle';
          break;

        case 'nonce':
          return 'nonce not yet defined. Use safeCrypto.generateNonce to first obtain nonce';
          break;

        case 'permSetHandle':
          return 'permSetHandle not yet defined. Use safeMutableData.newPermissionSet to first obtain permSetHandle';
          break;

        case 'cipherOptHandle':
          return 'cipherOptHandle not yet defined. Use either safeCipherOpt.newPlainText, safeCipherOpt.newSymmetric, or safeCipherOpt.newAsymmetric to first obtain cipherOptHandle';
          break;

        case 'authUri':
          return 'authUri not yet defined. Use safeApp.authorise to first obtain authUri';
          break;

        case 'appHandle':
          return 'appHandle not yet defined. Use safeApp.initialise to first obtain appHandle';
          break;

        case 'encryptedKey':
          return 'encryptedKey not yet defined. Use safeMutableData.encryptKey to first obtain encryptedKey';
          break;

        case 'encryptedValue':
          return 'encryptedValue not yet defined. Use safeMutableData.encryptValue to first obtain encryptedValue';
          break;

        case 'signKeyHandle':
          return 'signKeyHandle not yet defined. Use safeCrypto.getAppPubSignKey to first obtain signKeyHandle';
          break;

        case 'version':
          return 'version not yet defined. Use safeMutableData.getVersion to first obtain version';
          break;

        case 'fileContextHandle':
          return 'fileContextHandle not yet defined. Use safeNfs.create to first obtain fileContextHandle';
          break;

        case 'pubEncKeyHandle':
          return 'pubEncKeyHandle not yet defined. Use safeCrypto.getAppPubEncKey to first obtain pubEncKeyHandle';
          break;

        case 'keyPairHandle':
          return 'keyPairHandle not yet defined. Use safeCrypto.generateEncKeyPair to first obtain keyPairHandle';
          break;

        case 'rawSignKey':
          return 'rawSignKey not yet defined. Use safeCrypto.getSignKeyFromRaw to first obtain rawSignKey';
          break;

        case 'rawPubEncKey':
          return 'rawPubEncKey not yet defined. Use safeCryptoPubEncKey.getRaw to first obtain rawPubEncKey';
          break;

        case 'rawSecEncKey':
          return 'rawSecEncKey not yet defined. Use safeCryptoSecEncKey.getRaw to first obtain rawSecEncKey';
          break;

        case 'secEncKeyHandle':
          return 'secEncKeyHandle not yet defined. Use safeCryptoKeyPair.getSecEncKey to first obtain secEncKeyHandle';
          break;

        case 'encryptedBuffer':
          return 'encryptedBuffer not yet defined. Use safeCryptoPubEncKey.encryptSealed to first obtain encryptedBuffer';
          break;

        case 'idAddress':
          return 'idAddress not yet defined. Use safeImmutableData.closeWriter to first obtain idAddress';
          break;

        case 'serializedMD':
          return 'serializedMD not yet defined. Use safeMutableData.serialise to first obtain serializedMD';
          break;

        case 'hashedString ':
          return 'hashedString not yet defined. Use safeCrypto.sha3Hash to first obtain hashedString';
          break;

        default:
          return 'Error not yet recognized. Please inform developer.';
      }
    })(errorType);

    let div = document.createElement('div');
    div.setAttribute("class", "red-box output");
    let pEl = document.createElement('p');
    pEl.textContent = errorMessage;
    div.appendChild(pEl);

    let parentEl = document.getElementById('codebox');
    if(parentEl.children.length == 1) {
      parentEl.appendChild(div);
    } else {
      let parentChildren = parentEl.children;
      parentEl.insertBefore(div, parentChildren[1]);
    }
  }
}

window.handleSubmit = handleSubmit;

document.addEventListener('keyup', function(e) {
  let textAreaFocused = document.activeElement == document.getElementById('code');
  if(e.keyCode == 13 && !textAreaFocused) {
    handleSubmit();
  }
})

document.addEventListener('animationend', function(e) {
  let parentElement = document.getElementById('variables');
  Array.prototype.map.call(parentElement.children, function(elem) {
  	elem.removeAttribute('class');
  })
})

document.addEventListener('input', function(e) {
  e.target.style.height = '0px';
  e.target.style.height = e.target.scrollHeight + 'px';
});

module.exports = {};
