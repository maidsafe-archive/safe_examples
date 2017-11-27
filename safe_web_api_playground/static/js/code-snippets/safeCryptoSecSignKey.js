module.exports = {
  safeCryptoSecSignKey: {
    getRaw: async () => {
      rawSecSignKey = await window.safeCryptoSecSignKey.getRaw(secSignKeyHandle);
      return `Returns raw secret signing key: ${rawSecSignKey}`;
    },

    sign: async () => {
      const data = 'test information to be signed';
      signedData = await window.safeCryptoSecSignKey.sign(secSignKeyHandle, data);
      return `Returns signed data: ${String.fromCharCode.apply(null, new Uint8Array(signedData))}`;
    }, 

    free: () => {
      window.safeCryptoSecSignKey.free(secSignKeyHandle);
      secSignKeyHandle = null;
      return;
    },

  }
}
