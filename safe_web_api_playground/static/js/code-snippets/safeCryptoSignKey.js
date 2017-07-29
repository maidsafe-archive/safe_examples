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
      return window.safeCryptoSignKey.free(signKeyHandle)
      .then(_ => {
        signKeyHandle = null;
      	return 'signKeyHandle freed from memory';
      });
    },

  }
}
