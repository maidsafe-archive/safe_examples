module.exports = {
  safeCryptoEncKeyPair: {
    getPubEncKey: () => {
      return window.safeCryptoEncKeyPair.getPubEncKey(encKeyPairHandle)
      .then((res) => {
      	pubEncKeyHandle = res;

      	return 'Returns handle to the public key assocatiated with respective encrypted key pair: ' + res;
      })
    },

    getSecEncKey: () => {
      return window.safeCryptoEncKeyPair.getSecEncKey(encKeyPairHandle)
      .then((res) => {
      	secEncKeyHandle = res;

      	return 'Returns handle to secret key associated with respective encrypted key pair: ' + res;
      });
    },

    decryptSealed: () => {
      // let cipher = <encrypted data>;

      return window.safeCryptoEncKeyPair.decryptSealed(encKeyPairHandle, cipher)
      .then(data => {

      	return 'Returns decrypted data: ', String.fromCharCode.apply(null, new Uint8Array(data));
      })
    },

    free: () => {
      window.safeCryptoEncKeyPair.free(encKeyPairHandle);
      encKeyPairHandle = null;
      return;
    },

  }
}
