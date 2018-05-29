module.exports = {
  cryptoSecSignKey: {
    getRaw: async () => {
      try {
        rawSecSignKey = await secSignKey.getRaw();
      } catch(err) {
        return err;
      }
      return `Returns raw secret signing key: ${rawSecSignKey.buffer}`;
    },

    sign: async () => {
      const data = 'test information to be signed';
      try {
        signedData = await secSignKey.sign(data);
      } catch(err) {
        return err;
      }
      return `Returns signed data: ${signedData}`;
    }
  }
}
