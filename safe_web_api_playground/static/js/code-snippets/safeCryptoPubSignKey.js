module.exports = {
  safeCryptoPubSignKey: {
    getRaw: async () => {
      try {
        rawPubSignKey = await window.safeCryptoPubSignKey.getRaw(pubSignKeyHandle);
      } catch(err) {
        return err;
      }
      return `Returns raw public signing key: ${rawPubSignKey}`;
    },

    verify: async () => {
      try {
        var verifiedData = await window.safeCryptoPubSignKey.verify(pubSignKeyHandle, signedData);
      } catch(err) {
        return err;
      }
      return `Returns verfied data: ${String.fromCharCode.apply(null, verifiedData)}`;
    }, 

    free: () => {
      window.safeCryptoPubSignKey.free(pubSignKeyHandle);
      pubSignKeyHandle = null;
      return;
    },

  }
}
