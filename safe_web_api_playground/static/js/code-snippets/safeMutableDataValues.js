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

        console.log(String.fromCharCode.apply(null, new Uint8Array(v.buf)));

      }).then(_ => 'Iteration complete');
    },

    free: () => {
      window.safeMutableDataValues.free(valuesHandle);
      valuesHandle = null;
      return;
    },

  }
}
