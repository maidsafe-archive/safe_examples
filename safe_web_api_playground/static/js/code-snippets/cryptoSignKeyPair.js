module.exports = {
  cryptoSignKeyPair: {
    pubSignKey: async () => {
      try {
        pubSignKey = await signKeyPair.pubSignKey;
      } catch (err) {
        return err;
      }
      return `Returns public signing key handle: ${pubSignKey}`;
    },

    secSignKey: async () => {
      try {
        secSignKey = await signKeyPair.secSignKey;
      } catch(err) {
        return err;
      }
      return `Returns secret signing key handle: ${secSignKey}`;
    }
  }
};
