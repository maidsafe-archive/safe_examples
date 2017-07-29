module.exports = {
  safeCipherOpt: {
    newPlainText: () => {
      return window.safeCipherOpt.newPlainText(appToken)
      .then(res => {
      	cipherOptHandle = res;

      	return 'Returns cipherOptHandle: ' + res;
      });
    },

    newSymmetric: () => {
      return window.safeCipherOpt.newSymmetric(appToken)
      .then(res => {
      	cipherOptHandle = res;

      	return 'Returns symmetric cipherOptHandle: ' + res;
      })
    },

    newAsymmetric: () => {
      return window.safeCipherOpt.newAsymmetric(appToken)
      .then(res => {
      	cipherOptHandle = res;

      	return 'Returns asymmetric cipherOptHandle: ' + res;
      })
    },

    free: () => {
      return window.safeCipherOpt.free(cipherOptHandle)
      .then(_ => {
        cipherOptHandle = null;
      	return 'cipherOptHandle freed from memory';
      });
    },

  }
}
