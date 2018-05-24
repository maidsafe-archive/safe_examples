module.exports = {
  cryptoPubEncKey: {
    getRaw: async () => {
      try {
        rawPubEncKey = await pubEncKey.getRaw()
      } catch(err) {
        return err;
      }
      return `Public encryption key: ${rawPubEncKey.buffer}`;
    },

    encryptSealed: async () => {
      // For practical application use, pubEncKey should be the recipients public key
      // let stringOrBuffer = <utf-8 string> or <buffer>;
      const stringOrBuffer = 'plain string to be encrypted';
      try {
        encryptedBuffer = await pubEncKey.encryptSealed(stringOrBuffer)
      } catch(err) {
        return err;
      }
      return `Returns encrypted data: ${encryptedBuffer}`;
    },

    encrypt: async () => {
      // For practical application use, pubEncKey should be the recipients public key
      // stringOrBuffer can be <utf-8 string> or <buffer>;
      // secretKey must be 64 byte value
      const stringOrBuffer = 'plain string to be encrypted';
      try {
        encryptedBuffer = await pubEncKey.encrypt(stringOrBuffer, secEncKey)
      } catch(err) {
        return err;
      }
       return `Returns encrypted data: ${encryptedBuffer}`;
    }
  }
}
