module.exports = {
  safeMutableDataValues: {
    len: () => {
      // Need a valuesHandle?
      // Use safeMutableData.getValues to obtain it.

      return window.safeMutableDataValues.len(valuesHandle)
      .then((len) => {
      	return 'Number of values in the MutableData structure: ' + len;
      });
    },

    forEach: () => {
      // Use safeMutableData.getValues to obtain valuesHandle.

      return window.safeMutableDataValues.forEach(valuesHandle, (v) => {

        this.send('forEachResult', v.buf);

      }).then(_ => forEachResults.join('\n'));
    },

    free: () => {
      valuesHandle = null;

      return window.safeMutableDataValues.free(valuesHandle);
    },

  }
}
