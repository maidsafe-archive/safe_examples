module.exports = {
  safeCipherOpt: {
    newPlainText: async () => {
      try {
        cipherOptHandle = await window.safeCipherOpt.newPlainText(appHandle);
      } catch (err) {
        return err;
      }
      return `Returns plain text cipher option object handle ${cipherOptHandle}`;
    },

    newSymmetric: async () => {
      try {
        cipherOptHandle = await window.safeCipherOpt.newSymmetric(appHandle);
      } catch (err) {
        return err;
      }
      return `Returns symmetric cipherOptHandle: ${cipherOptHandle}`; 
    },

    newAsymmetric: async () => {
      try {
        cipherOptHandle = await window.safeCipherOpt.newAsymmetric(appHandle);
      } catch (err) {
        return err;
      }
      return `Returns asymmetric cipherOptHandle: ${cipherOptHandle}`;
    },

    free: () => {
      window.safeCipherOpt.free(cipherOptHandle);
      cipherOptHandle = null;
      return;
    },

  }
}
