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
      return `Value: ${value.buf}`;
    },

    listEntries: async () => {
      // Use safeMutableData.getEntries to obtain entriesHandle

      try {
        var entriesArray = await window.safeMutableDataEntries.listEntries(entriesHandle);
        entriesArray.forEach((entry) => {
          const key = entry.key.toString();
          const value = entry.value.buf.toString();
          console.log('Key: ', key);
          console.log('Value: ', value);
        });
      } catch(err) {
        return err;
      }
      return entriesArray;
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
