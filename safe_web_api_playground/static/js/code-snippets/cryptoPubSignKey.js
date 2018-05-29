module.exports = {
  cryptoPubSignKey: {
    getRaw: async () => {
      try {
        rawPubSignKey = await pubSignKey.getRaw();
      } catch(err) {
        return err;
      }
      return `Returns raw public signing key: ${rawPubSignKey}`;
    },

    verify: async () => {
      try {
        var verifiedData = await pubSignKey.verify(signedData);
      } catch(err) {
        return err;
      }
      return `Returns verfied data: ${verifiedData}`;
    }
  }
}
