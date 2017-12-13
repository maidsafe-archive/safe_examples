module.exports = {
  safeCryptoPubEncKey: {
    getRaw: async () => {
      try {
        rawPubEncKey = await window.safeCryptoPubEncKey.getRaw(pubEncKeyHandle)
      } catch(err) {
        return err;
      }
      return `Public encryption key: ${String.fromCharCode.apply(null, new Uint8Array(res.buffer))}`;
    },

    encryptSealed: async () => {
      // For practical application use, pubEncKeyHandle should be the recipients public key
      // let str = <utf-8 string> or <buffer>;
      try {
        encryptedBuffer = await window.safeCryptoPubEncKey.encryptSealed(pubEncKeyHandle, str)
      } catch(err) {
        return err;
      }
      return `Returns encrypted data: ${String.fromCharCode.apply(null, new Uint8Array(res))}`;
    },

    encrypt: async () => {
      // For practical application use, pubEncKeyHandle should be the recipients public key
      // str can be <utf-8 string> or <buffer>;
      // secretKey must be 64-bit value
      try {
        encryptedBuffer = await window.safeCryptoPubEncKey.encrypt(pubEncKeyHandle, str, secretKey)
      } catch(err) {
        return err;
      }
       return `Returns encrypted data: ${String.fromCharCode.apply(null, new Uint8Array(res))}`;
    },

    free: () => {
      window.safeCryptoPubEncKey.free(pubEncKeyHandle);
      pubEncKeyHandle = null;
      return;
    },

  }
}
