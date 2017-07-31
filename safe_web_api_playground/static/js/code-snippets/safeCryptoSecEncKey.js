module.exports = {
  safeCryptoSecEncKey: {
    getRaw: () => {
      return window.safeCryptoSecEncKey.getRaw(secEncKeyHandle)
      .then((res) => {
      	rawSecEncKey = res.buffer;

      	return 'Secret encryption key raw string: ', String.fromCharCode.apply(null, new Uint8Array(res.buffer));
      });
    },

    decrypt: () => {
      return window.safeCryptoSecEncKey.decrypt(secEncKeyHandle, cipher, pubEncKeyHandle)
      .then(res => {
      	encryptedBuffer = res.buffer;

      	return 'Returns encrypted data: ', String.fromCharCode.apply(null, new Uint8Array(res.buffer));
      });
    },

    free: () => {
      secEncKeyHandle = null;
      return window.safeCryptoSecEncKey.free(secEncKeyHandle);
    },

  }
}
