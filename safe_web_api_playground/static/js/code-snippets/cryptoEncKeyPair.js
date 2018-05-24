module.exports = {
  cryptoEncKeyPair: {
    pubEncKey: async () => {
      try {
        pubEncKey = encKeyPair.pubEncKey;
      } catch (err) {
        return err;
      }
      return `Returns interface to the public key assocatiated with respective encrypted key pair: ${pubEncKey}`;
    },

    secEncKey: async () => {
      try {
        secEncKey = encKeyPair.secEncKey;
      } catch(err) {
        return err;
      }
      return `Returns interface to secret key associated with respective encrypted key pair: ${secEncKey}`;
    },

    decryptSealed: async () => {
      // let encryptedBuffer = <encrypted data>;
      try {
        decipheredBuffer = await encKeyPair.decryptSealed(encryptedBuffer)
      } catch(err) {
        return err;
      }
      return `Returns decrypted data: ${decipheredBuffer}`;
    }
  }
}
