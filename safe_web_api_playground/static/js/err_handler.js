const apiVariables = require('./api_variables');
const errCase = (type) => {
      switch(type) {
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

	case 'signKeyPairHandle':
	  return 'signKeyPairHandle not yet defined. Use safeCrypto.generateSignKeyPair to first obtain signKeyPairHandle';
	  break;

        case 'pubSignKeyHandle':
          return 'pubSignKeyHandle not yet defined. Use safeCrypto.getAppPubSignKey to first obtain pubSignKeyHandle';
          break;

	case 'secSignKeyHandle':
	  return 'secSignKeyHandle not yet defined. Use safeCryptoSignKeyPair.getSecSignKey to first obtain secSignKeyHandle';
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

        case 'secEncKeyHandle':
          return 'secEncKeyHandle not yet defined. Use safeCryptoKeyPair.getSecEncKey to first obtain secEncKeyHandle';
          break;

        case 'encKeyPairHandle':
          return 'encKeyPairHandle not yet defined. Use safeCrypto.generateEncKeyPair to first obtain encKeyPairHandle';
          break;

        case 'rawPubSignKey':
          return 'rawPubSignKey not yet defined. Use safeCrypto.pubSignKeyFromRaw to first obtain rawPubSignKey';
          break;

        case 'rawSecSignKey':
          return 'rawSecSignKey not yet defined. Use safeCrypto.secSignKeyFromRaw to first obtain rawSecSignKey';
          break;

        case 'rawPubEncKey':
          return 'rawPubEncKey not yet defined. Use safeCryptoPubEncKey.getRaw to first obtain rawPubEncKey';
          break;

        case 'rawSecEncKey':
          return 'rawSecEncKey not yet defined. Use safeCryptoSecEncKey.getRaw to first obtain rawSecEncKey';
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

        case 'hashedString':
          return 'hashedString not yet defined. Use safeCrypto.sha3Hash to first obtain hashedString';
          break;
	
	case 'signedData':
	  return 'signedData is not yet defined. Use safeCryptoSecSignKey.sign to first obtain signeData';
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
};

module.exports = {
  handleReferenceError,
  handleIncompleteSetup
};
