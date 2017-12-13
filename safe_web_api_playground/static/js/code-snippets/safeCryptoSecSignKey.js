module.exports = {
  safeCryptoSecSignKey: {
    getRaw: async () => {
      try {
        rawSecSignKey = await window.safeCryptoSecSignKey.getRaw(secSignKeyHandle);
      } catch(err) {
        return err;
      }
      return `Returns raw secret signing key: ${rawSecSignKey}`;
    },

    sign: async () => {
      const data = 'test information to be signed';
      try {
        signedData = await window.safeCryptoSecSignKey.sign(secSignKeyHandle, data);
      } catch(err) {
        return err;
      }
      return `Returns signed data: ${String.fromCharCode.apply(null, new Uint8Array(signedData))}`;
    }, 

    free: () => {
      window.safeCryptoSecSignKey.free(secSignKeyHandle);
      secSignKeyHandle = null;
      return;
    },

  }
}
