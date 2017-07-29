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

      	this.send('forEachResult', String.fromCharCode.apply(null, k));

      }).then(_ => forEachResults.join('\n'));
    },

    free: () => {
      return window.safeMutableDataKeys.free(keysHandle)
      .then(_ => {
        keysHandle = null;
      	return 'keysHandle is freed from memory';
      });
    },

  }
}
