module.exports = {
  safeCrypto: {
    sha3Hash: () => {
      return window.safeCrypto.sha3Hash(appHandle, '1010101010101')
      .then((res) => {
        hashedString = res;
      	return 'SHA3 Hash generated: ', String.fromCharCode.apply(null, new Uint8Array(res));
      });
    },

    getAppPubSignKey: () => {
      return window.safeCrypto.getAppPubSignKey(appHandle)
      .then((res) => {
      	signKeyHandle = res;

      	return 'Returns applications public signing key: ' + res;
      });
    },

    getAppPubEncKey: () => {
      return window.safeCrypto.getAppPubEncKey(appHandle)
      .then((res) => {
      	pubEncKeyHandle = res;

      	// This handle may be used to operate safeCryptoPubEncKey functions
      	return 'Returns handle to application\'s public encryption key: ' + res;
      });
    },

    generateEncKeyPair: () => {
      return window.safeCrypto.generateEncKeyPair(appHandle)
    	.then((res) => {
      	keyPairHandle = res;

      	return 'Returns handle to asymmetric encrypted key pair: ' + res;
      });
    },

    getSignKeyFromRaw: () => {
      return window.safeCrypto.getSignKeyFromRaw(appHandle, rawSignKey)
      .then((res) => {
      	signKeyHandle = res;

      	return 'Returns handle to signing key: ' + res;
      });
    },

    pubEncKeyKeyFromRaw: () => {
      return window.safeCrypto.pubEncKeyKeyFromRaw(appHandle, rawPubEncKey)
      .then((res) => {
      	pubEncKeyHandle = res;

      	return 'Returns handle to application\'s public enryption key: ' + res;
      });
    },

    secEncKeyKeyFromRaw: () => {
      return window.safeCrypto.secEncKeyKeyFromRaw(appHandle, rawSecEncKey)
      .then((res) => {
      	secEncKeyHandle = res;

      	return 'Returns handle to secret encrypted key: ' + res;
      });
    },

    generateEncKeyPairFromRaw: () => {
      return window.safeCrypto.generateEncKeyPairFromRaw(appHandle, rawPubEncKey, rawSecEncKey)
      .then((res) => {
      	keyPairHandle = res;

      	return 'Encryption key pair generated from raw strings: ' + res;
      });
    },

    generateNonce: () => {
      return window.safeCrypto.generateNonce(appHandle)
      .then((res) => {
      	nonce = res.buffer;

      	return 'Nonce generated: ' + String.fromCharCode.apply(null, new Uint8Array(res.buffer));;
      });
    },

  }
}
