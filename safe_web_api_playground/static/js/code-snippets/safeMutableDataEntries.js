module.exports = {
  safeMutableDataEntries: {
    len: () => {
      // Wondering where to obtain entriesHandle?
      // Use safeMutableData.getEntries in the above module to get an entries handle.

      return window.safeMutableDataEntries.len(entriesHandle)
      .then((len) => {
      	return 'Number of entries in the MutableData: '+ len;
      });
    },

    get: () => {
      // Looks up the value of a specific key
      // Use safeMutableData.getEntries to obtain entriesHandle

      return window.safeMutableDataEntries.get(entriesHandle, 'key1')
      .then((value) => {
      	return 'Value: ' + value;
      });
    },

    forEach: () => {
      // Use safeMutableData.getEntries to obtain entriesHandle

      // Look for console log output in your safe browser console, not this console

      return window.safeMutableDataEntries.forEach(entriesHandle, (k, v) => {

        let key = String.fromCharCode.apply(null, k);
        let value = String.fromCharCode.apply(null, new Uint8Array(v.buf));

        this.send('forEachResult', {key: key, value: v.buf});

      }).then(_ => forEachResults.join('\n'))
    },

    insert: () => {
      return window.safeMutableDataEntries.insert(entriesHandle, 'key1', 'value1')
      .then(_ => 'New entry inserted');
    },

    mutate: () => {
      // Use safeMutableData.getEntries to obtain entriesHandle

      return window.safeMutableDataEntries.mutate(entriesHandle)
      .then((res) => {
      	mutationHandle = res;
      	return 'Returns mutation handle: ' + res;
      })
    },

    free: () => {
      entriesHandle = null;

      return window.safeMutableDataEntries.free(entriesHandle);
    },

  }
}
