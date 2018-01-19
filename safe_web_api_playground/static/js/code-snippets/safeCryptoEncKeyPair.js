module.exports = {
  safeCryptoEncKeyPair: {
    getPubEncKey: async () => {
      try {
        pubEncKeyHandle = await window.safeCryptoEncKeyPair.getPubEncKey(encKeyPairHandle)
      } catch (err) {
        return err;
      }
      return `Returns handle to the public key assocatiated with respective encrypted key pair: ${pubEncKeyHandle}`;
    },

    getSecEncKey: async () => {
      try {
        secEncKeyHandle = await window.safeCryptoEncKeyPair.getSecEncKey(encKeyPairHandle)
      } catch(err) {
        return err;
      }
      return `Returns handle to secret key associated with respective encrypted key pair: ${secEncKeyHandle}`;
    },

    decryptSealed: async () => {
      // let encryptedBuffer = <encrypted data>;
      try {
        decipheredBuffer = await window.safeCryptoEncKeyPair.decryptSealed(encKeyPairHandle, encryptedBuffer)
      } catch(err) {
        return err;
      }
      return `Returns decrypted data: ${String.fromCharCode.apply(null, decipheredBuffer)}`;
    },

    free: () => {
      window.safeCryptoEncKeyPair.free(encKeyPairHandle);
      encKeyPairHandle = null;
      return;
    },

  }
}
