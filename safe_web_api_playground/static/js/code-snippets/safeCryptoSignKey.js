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
      window.safeCryptoSignKey.free(signKeyHandle);
      signKeyHandle = null;
      return;
    },

  }
}
