module.exports = {
  safeCryptoSignKey: {
    getRaw: () => {
      return window.safeCryptoSignKey.getRaw(signKeyHandle)
      .then((res) => {
      	rawSignKey = res.buffer;

      	return 'Returns raw signing key: ' + res.buffer;
      });
    },

    free: () => {
      signKeyHandle = null;
      return window.safeCryptoSignKey.free(signKeyHandle);
    },

  }
}
