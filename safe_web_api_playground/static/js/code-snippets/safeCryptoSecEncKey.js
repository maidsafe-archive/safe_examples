module.exports = {
  safeCryptoSecEncKey: {
    getRaw: async () => {
     try {
       rawSecEncKey = await window.safeCryptoSecEncKey.getRaw(secEncKeyHandle)
     } catch(err) {
       return err;
     }
     return `Secret encryption key raw string: ${rawSecEncKey.buffer}`;
    },

    decrypt: async () => {
      try {
        decipheredBuffer = await window.safeCryptoSecEncKey.decrypt(secEncKeyHandle, encryptedBuffer, pubEncKeyHandle)
      } catch(err) {
        return err;
      }
      return `Returns deciphered data: ${decipheredBuffer}`;
    },

    free: () => {
      window.safeCryptoSecEncKey.free(secEncKeyHandle);
      secEncKeyHandle = null;
      return;
    },

  }
}
