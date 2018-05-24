module.exports = {
  mutableDataEntries: {
    len: async () => {
      try {
        var length = await entries.len()
      } catch(err) {
        return err;
      }
      return `Number of entries in the MutableData: ${length}`;
    },

    get: async () => {
      // Looks up the value of a specific key
      try {
        var value = await entries.get('key1')
      } catch (err) {
        return err;
      }
      return `Value: ${value.buf}`;
    },

    listEntries: async () => {
      try {
        var entriesArray = await entries.listEntries(entriesHandle);
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
        await entries.insert('key1', 'value1')
      } catch(err) {
        return err;
      }
      return 'New entry inserted';
    },

    mutate: async () => {
      try {
        mutationHandle = await entries.mutate()
      } catch(err) {
        return err;
      }
      return `Returns mutation handle: ${mutationHandle}`;
    }
  }
}
