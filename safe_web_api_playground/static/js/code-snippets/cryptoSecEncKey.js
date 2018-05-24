module.exports = {
  cryptoSecEncKey: {
    getRaw: async () => {
     try {
       rawSecEncKey = await secEncKey.getRaw()
     } catch(err) {
       return err;
     }
     return `Secret encryption key raw string: ${rawSecEncKey.buffer}`;
    },

    decrypt: async () => {
      try {
        decipheredBuffer = await secEncKey.decrypt(encryptedBuffer, pubEncKey)
      } catch(err) {
        return err;
      }
      return `Returns deciphered data: ${decipheredBuffer}`;
    }
  }
}
