module.exports = {
  safeCryptoPubEncKey: {
    getRaw: () => {
      return window.safeCryptoPubEncKey.getRaw(pubEncKeyHandle)
      .then((res) => {
      	rawPubEncKey = res.buffer;

      	return 'Public encryption key: '+ String.fromCharCode.apply(null, new Uint8Array(res.buffer));
      });
    },

    encryptSealed: () => {
      // For practical application use, pubEncKeyHandle should be the recipients public key
      // let str = <utf-8 string> or <buffer>;

      return window.safeCryptoPubEncKey.encryptSealed(pubEncKeyHandle, str)
      .then(res => {
      	encryptedBuffer = res;

      	return 'Returns encrypted data: ' + String.fromCharCode.apply(null, new Uint8Array(res));
      });
    },

    encrypt: () => {
      // For practical application use, pubEncKeyHandle should be the recipients public key
      // str can be <utf-8 string> or <buffer>;
      // secretKey must be 64-bit value

      return window.safeCryptoPubEncKey.encrypt(pubEncKeyHandle, str, secretKey)
      .then(res => {
      	encryptedBuffer = res;

      	return 'Returns encrypted data: '+  String.fromCharCode.apply(null, new Uint8Array(res));
      });
    },

    free: () => {
      window.safeCryptoPubEncKey.free(pubEncKeyHandle);
      pubEncKeyHandle = null;
      return;
    },

  }
}
