module.exports = {
  safeCryptoSecEncKey: {
    getRaw: async () => {
     try {
       rawSecEncKey = await window.safeCryptoSecEncKey.getRaw(secEncKeyHandle)
     } catch(err) {
       return err;
     }
     return `Secret encryption key raw string: ${String.fromCharCode.apply(null, new Uint8Array(res.buffer))}`;
    },

    decrypt: async () => {
      try {
        encryptedBuffer = await window.safeCryptoSecEncKey.decrypt(secEncKeyHandle, cipher, pubEncKeyHandle)
      } catch(err) {
        return err;
      }
      return `Returns encrypted data: ${String.fromCharCode.apply(null, new Uint8Array(res.buffer))}`;
    },

    free: () => {
      window.safeCryptoSecEncKey.free(secEncKeyHandle);
      secEncKeyHandle = null;
      return;
    },

  }
}
