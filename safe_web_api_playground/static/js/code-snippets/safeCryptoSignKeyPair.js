module.exports = {
  safeCryptoSignKeyPair: {
    getPubSignKey: async () => {
      try {
        pubSignKeyHandle = await window.safeCryptoSignKeyPair.getPubSignKey(signKeyPairHandle);
      } catch (err) {
        return err;
      }
      return `Returns public signing key handle: ${pubSignKeyHandle}`;
    },

    getSecSignKey: async () => {
      try {
        secSignKeyHandle = await window.safeCryptoSignKeyPair.getSecSignKey(signKeyPairHandle);
      } catch(err) {
        return err;
      }
      return `Returns secret signing key handle: ${secSignKeyHandle}`;
    }
  }
};
