module.exports = {
  cipherOpt: {
    newPlainText: async () => {
      try {
        cipherOpt = await app.cipherOpt.newPlainText();
      } catch (err) {
        return err;
      }
      return `Returns plain text cipher option object handle ${cipherOpt}`;
    },

    newSymmetric: async () => {
      try {
        cipherOpt = await app.cipherOpt.newSymmetric();
      } catch (err) {
        return err;
      }
      return `Returns symmetric cipherOptHandle: ${cipherOpt}`; 
    },

    newAsymmetric: async () => {
      try {
        cipherOpt = await app.cipherOpt.newAsymmetric(pubEncKey);
      } catch (err) {
        return err;
      }
      return `Returns asymmetric cipherOptHandle: ${cipherOpt}`;
    }
  }
}
