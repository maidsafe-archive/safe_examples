module.exports = {
  safeCipherOpt: {
    newPlainText: () => {
      return window.safeCipherOpt.newPlainText(appHandle)
      .then(res => {
      	cipherOptHandle = res;

      	return 'Returns cipherOptHandle: ' + res;
      });
    },

    newSymmetric: () => {
      return window.safeCipherOpt.newSymmetric(appHandle)
      .then(res => {
      	cipherOptHandle = res;

      	return 'Returns symmetric cipherOptHandle: ' + res;
      })
    },

    newAsymmetric: () => {
      return window.safeCipherOpt.newAsymmetric(appHandle)
      .then(res => {
      	cipherOptHandle = res;

      	return 'Returns asymmetric cipherOptHandle: ' + res;
      })
    },

    free: () => {
      cipherOptHandle = null;
      
      return window.safeCipherOpt.free(cipherOptHandle);
    },

  }
}
