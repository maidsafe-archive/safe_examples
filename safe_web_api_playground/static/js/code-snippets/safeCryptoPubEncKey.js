module.exports = {
  safeCryptoPubEncKey: {
    getRaw: async () => {
      try {
        rawPubEncKey = await window.safeCryptoPubEncKey.getRaw(pubEncKeyHandle)
      } catch(err) {
        return err;
      }
      return `Public encryption key: ${String.fromCharCode.apply(null, rawPubEncKey.buffer)}`;
    },

    encryptSealed: async () => {
      // For practical application use, pubEncKeyHandle should be the recipients public key
      // let stringOrBuffer = <utf-8 string> or <buffer>;
      const stringOrBuffer = 'plain string to be encrypted';
      try {
        encryptedBuffer = await window.safeCryptoPubEncKey.encryptSealed(pubEncKeyHandle, stringOrBuffer)
      } catch(err) {
        return err;
      }
      return `Returns encrypted data: ${String.fromCharCode.apply(null, encryptedBuffer)}`;
    },

    encrypt: async () => {
      // For practical application use, pubEncKeyHandle should be the recipients public key
      // stringOrBuffer can be <utf-8 string> or <buffer>;
      // secretKey must be 64-bit value
      const stringOrBuffer = 'plain string to be encrypted';
      try {
        encryptedBuffer = await window.safeCryptoPubEncKey.encrypt(pubEncKeyHandle, stringOrBuffer, secEncKeyHandle)
      } catch(err) {
        return err;
      }
       return `Returns encrypted data: ${String.fromCharCode.apply(null, encryptedBuffer)}`;
    },

    free: () => {
      window.safeCryptoPubEncKey.free(pubEncKeyHandle);
      pubEncKeyHandle = null;
      return;
    },

  }
}
