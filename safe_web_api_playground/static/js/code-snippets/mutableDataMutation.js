module.exports = {
  mutableDataMutation: {
    insert: async () => {
      try {
        await mutation.insert('key1', 'value1')
      } catch(err) {
        return err;
      }
      return 'Registers an insert operation with mutation handle, later to be applied.';

        // You must now run mData.applyEntriesMutation(mdHandle, mutationHandle) to save changes.
    },

    remove: async () => {
      try {
        await mutation.remove('key1', value.version + 1)
      } catch(err) {
        return err;
      }
      return 'Registers a remove operation with mutation handle, later to be applied.' + _;

      	// You must now run mData.applyEntriesMutation(mdHandle, mutationHandle) to save changes
    },

    update: async () => {
      // Use safeMutableData.newMutation to obtain mutationHandle
      try {
        await mutation.update('key1', 'newValue', value.version + 1)
      } catch(err) {
        return err;
      }

      	return 'Registers an update operation with mutation handle, later to be applied.' + _;

      	// You must now run mData.applyEntriesMutation(mdHandle, mutationHandle) to save changes
    }
  }
}
