module.exports = {
  safeMutableDataKeys: {
    len: () => {
      // How to obtain keyHandle?
      // First use safeMutableData.getKeys to obtain keyHandle.

      return window.safeMutableDataKeys.len(keysHandle)
      .then((len) => {
      	return 'Number of keys in the MutableData: ' + len;
      });
    },

    forEach: () => {
      // Use safeMutableData.getKeys to obtain keyHandle\n

      return window.safeMutableDataKeys.forEach(keysHandle, (k) => {

      	console.log(String.fromCharCode.apply(null, k));

      }).then(_ => {
        return 'Iteration complete' + _;
      });
    },

    free: () => {
      window.safeMutableDataKeys.free(keysHandle);
      keysHandle = null;
      return;
    },

  }
}
