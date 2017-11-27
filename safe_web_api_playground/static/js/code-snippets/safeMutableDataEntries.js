module.exports = {
  safeMutableDataEntries: {
    len: async () => {
      // Wondering where to obtain entriesHandle?
      // Use safeMutableData.getEntries in the above module to get an entries handle.
      try {
        var length = await window.safeMutableDataEntries.len(entriesHandle)
      } catch(err) {
        return err;
      }
      return `Number of entries in the MutableData: ${length}`;
    },

    get: async () => {
      // Looks up the value of a specific key
      // Use safeMutableData.getEntries to obtain entriesHandle
      try {
        var value = await window.safeMutableDataEntries.get(entriesHandle, 'key1')
      } catch (err) {
        return err;
      }
      return `Value: ${String.fromCharCode.apply(null, new Uint8Array(value.buf))}`;
    },

    forEach: async () => {
      // Use safeMutableData.getEntries to obtain entriesHandle

      // Look for console log output in your safe browser console, not this console
      try {
        await window.safeMutableDataEntries.forEach(entriesHandle, (k, v) => {

          let key = String.fromCharCode.apply(null, k);
          let value = String.fromCharCode.apply(null, new Uint8Array(v.buf));

          console.log(key + ': ' + value);

        })
      } catch(err) {
        return err;
      }
      return 'Iteration complete';
    },

    insert: async () => {
      try {
        await window.safeMutableDataEntries.insert(entriesHandle, 'key1', 'value1')
      } catch(err) {
        return err;
      }
      return 'New entry inserted';
    },

    mutate: async () => {
      // Use safeMutableData.getEntries to obtain entriesHandle
      try {
        mutationHandle = await window.safeMutableDataEntries.mutate(entriesHandle)
      } catch(err) {
        return err;
      }
      return `Returns mutation handle: ${mutationHandle}`;
    },

    free: () => {
      window.safeMutableDataEntries.free(entriesHandle);
      entriesHandle = null;
      return;
    },

  }
}
