module.exports = {
  safeCryptoKeyPair: {
    getPubEncKey: () => {
      return window.safeCryptoKeyPair.getPubEncKey(keyPairHandle)
      .then((res) => {
      	pubEncKeyHandle = res;

      	return 'Returns handle to the public key assocatiated with respective encrypted key pair: ' + res;
      })
    },

    getSecEncKey: () => {
      return window.safeCryptoKeyPair.getSecEncKey(keyPairHandle)
      .then((res) => {
      	secEncKeyHandle = res;

      	return 'Returns handle to secret key associated with respective encrypted key pair: ' + res;
      });
    },

    decryptSealed: () => {
      // let cipher = <encrypted data>;

      return window.safeCryptoKeyPair.decryptSealed(keyPairHandle, cipher)
      .then(data => {

      	return 'Returns decrypted data: ', String.fromCharCode.apply(null, new Uint8Array(data));
      })
    },

    free: () => {
      window.safeCryptoKeyPair.free(keyPairHandle);
      keyPairHandle = null;
      return;
    },

  }
}
