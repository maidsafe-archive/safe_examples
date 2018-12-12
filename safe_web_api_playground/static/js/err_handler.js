const apiVariables = require('./api_variables');
const errCase = (type) => {
      switch(type) {
        case 'entries':
          return 'entries not yet defined. Use mData.getEntries or .newEntries to first obtain entries';
          break;

        case 'mutation':
          return 'mutation not yet defined. Use mData.newMutation to first obtain mutation';
          break;

        case 'perms':
          return 'perms not yet defined. Use mData.getPermissions to first obtain perms';
          break;

        case 'nfs':
          return 'nfs not yet defined. Use mData.emulateAs to first obtain nfs';
          break;

        case 'rdf':
          return 'rdf not yet defined. Use mData.emulateAs to first obtain rdf';
          break;

        case 'webid':
          return 'webid not yet defined. Use mData.emulateAs to first obtain webid';
          break;

        case 'iDataWriter':
          return 'iDataWriter not yet defined. Use app.immutableData.create to first obtain iDataWriter interface';
          break;

        case 'iDataReader':
          return 'iDataReader not yet defined. Use app.immutableData.fetch to first obtain iDataReader interface';
          break;

        case 'mData':
          return 'mData not yet defined. Use one of the first 4 functions from the MutableData section to first obtain mData';
          break;

        case 'nonce':
          return 'nonce not yet defined. Use app.crypto.generateNonce to first obtain nonce';
          break;

        case 'cipherOpt':
          return 'cipherOpt not yet defined. Open cipherOption section and choose of the options to optain cipherOpt value';
          break;

        case 'authUri':
          return 'authUri not yet defined. Use safe.authorise to first obtain authUri';
          break;

        case 'app':
          return 'app not yet defined. Use safe.initialiseApp to first obtain app interface';
          break;

        case 'encryptedKey':
          return 'encryptedKey not yet defined. Use mData.encryptKey to first obtain encryptedKey buffer';
          break;

        case 'encryptedValue':
          return 'encryptedValue not yet defined. Use mData.encryptValue to first obtain encryptedValue buffer';
          break;

	case 'signKeyPair':
	  return 'signKeyPair not yet defined. Use app.crypto.generateSignKeyPair to first obtain signKeyPair';
	  break;

        case 'pubSignKey':
          return 'pubSignKey not yet defined. Use app.crypto.getAppPubSignKey to first obtain pubSignKey';
          break;

	case 'secSignKey':
	  return 'secSignKey not yet defined. Use signKeyPair.secSignKey to first obtain secSignKey';
	  break;

        case 'version':
          return 'version not yet defined. Use mData.getVersion to first obtain version';
          break;

        case 'fileContext':
          return 'fileContext not yet defined. Use nfs.create to first obtain fileContext';
          break;

        case 'pubEncKey':
          return 'pubEncKey not yet defined. Use app.crypto.getAppPubEncKey to first obtain pubEncKey';
          break;

        case 'secEncKey':
          return 'secEncKey not yet defined. Use encKeyPair.getSecEncKey to first obtain secEncKey';
          break;

        case 'encKeyPair':
          return 'encKeyPair not yet defined. Use app.crypto.generateEncKeyPair to first obtain encKeyPair';
          break;

        case 'rawPubSignKey':
          return 'rawPubSignKey not yet defined. Use app.crypto.pubSignKeyFromRaw to first obtain rawPubSignKey';
          break;

        case 'rawSecSignKey':
          return 'rawSecSignKey not yet defined. Use app.crypto.secSignKeyFromRaw to first obtain rawSecSignKey';
          break;

        case 'rawPubEncKey':
          return 'rawPubEncKey not yet defined. Use pubEncKey.getRaw to first obtain rawPubEncKey';
          break;

        case 'rawSecEncKey':
          return 'rawSecEncKey not yet defined. Use secEncKey.getRaw to first obtain rawSecEncKey';
          break;

        case 'encryptedBuffer':
          return 'encryptedBuffer not yet defined. Use pubEncKey.encryptSealed to first obtain encryptedBuffer';
          break;

        case 'iDataAddress':
          return 'iDataAddress not yet defined. Use iDataWriter.closeWriter to first obtain iDataAddress';
          break;

        case 'serialisedMD':
          return 'serialisedMD not yet defined. Use mData.serialise to first obtain serialisedMD';
          break;

        case 'hashedString':
          return 'hashedString not yet defined. Use app.crypto.sha3Hash to first obtain hashedString';
          break;
	
	case 'signedData':
	  return 'signedData is not yet defined. Use secSignKey.sign to first obtain signeData';
	  break;

	case 'value':
	  return 'value is not yet defined. Use mData.get to first obtain value';
	  break;

        default:
          return 'Error not yet recognized. Please inform developer.';
      }
};

const handleReferenceError = (e) => {
  console.log(e.message);

  let errorType = apiVariables.find(function(string) {
    let regex = new RegExp(string);
    return regex.test(e.message);
  });

  let errorMessage = errCase(errorType); 
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
};

const handleIncompleteSetup = () => {
  let div = document.createElement('div');
  div.setAttribute("class", "red-box output");
  let p1 = document.createElement('p');
  let p2 = document.createElement('p');
  let p3 = document.createElement('p');
  let p4 = document.createElement('p');
  let p5 = document.createElement('p');
  let p6 = document.createElement('p');
  p1.textContent = 'Your app interface is not yet authorised to perform this operation.';
  p2.textContent = '- First run safe.initialiseApp';
  p3.textContent = '- Then run app.auth.genAuthUri';
  p4.textContent = '- Then run safe.authorise';
  p5.textContent = '- Finally, run app.auth.loginFromUri';
  p6.textContent = 'Your app interface will then be authorised to perform this operation!';
  div.appendChild(p1);
  let pElArray = [p1, p2, p3, p4, p5, p6];
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
};

const handleExperimentalApi = () => {
  let div = document.createElement('div');
  div.setAttribute("class", "red-box output");
  let p1 = document.createElement('p');
  let p2 = document.createElement('p');
  let p3 = document.createElement('p');
  let p4 = document.createElement('p');
  let p5 = document.createElement('p');
  let p6 = document.createElement('p');
  p1.textContent = 'You are attempting to run an experimental feature.';
  p2.textContent = '- In upper right-hand corner of browser, click on icon with 3 vertical dots.';
  p3.textContent = '- Look for "Toggle Experiments" and turn it on.';
  p4.textContent = '- All tabs will refresh.';
  p5.textContent = '- You should then see flask icon in address bar, to indicate experimental features toggled on.';
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
};

module.exports = {
  handleReferenceError,
  handleIncompleteSetup,
  handleExperimentalApi
};
