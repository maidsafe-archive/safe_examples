module.exports = {
  safeCryptoPubSignKey: {
    getRaw: async () => {
      rawPubSignKey = await window.safeCryptoPubSignKey.getRaw(pubSignKeyHandle);
      return `Returns raw public signing key: ${rawPubSignKey}`;
    },

    verify: async () => {
      const verifiedData = await window.safeCryptoPubSignKey.verify(pubSignKeyHandle, signedData);
      return `Returns verfied data: ${String.fromCharCode.apply(null, new Uint8Array(verifiedData))}`;
    }, 

    free: () => {
      window.safeCryptoPubSignKey.free(pubSignKeyHandle);
      pubSignKeyHandle = null;
      return;
    },

  }
}
