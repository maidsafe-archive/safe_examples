module.exports = {
  safeMutableDataMutation: {
    insert: async () => {
      // Use safeMutableData.newMutation to obtain mutationHandle
      try {
        await window.safeMutableDataMutation.insert(mutationHandle, 'key1', 'value1')
      } catch(err) {
        return err;
      }
      return 'Registers an insert operation with mutation handle, later to be applied.';

        // You must now run safeMutableData.applyEntriesMutation(mdHandle, mutationHandle) to save changes.
    },

    delete: async () => {
      // Use safeMutableData.newMutation to obtain mutationHandle
      try {
        await window.safeMutableDataMutation.delete(mutationHandle, 'key1', value.version + 1)
      } catch(err) {
        return err;
      }
      return 'Registers a delete operation with mutation handle, later to be applied.' + _;

      	// You must now run safeMutableData.applyEntriesMutation(mdHandle, mutationHandle) to save changes
    },

    update: async () => {
      // Use safeMutableData.newMutation to obtain mutationHandle
      try {
        await window.safeMutableDataMutation.update(mutationHandle, 'key1', 'newValue', value.version + 1)
      } catch(err) {
        return err;
      }

      	return 'Registers an update operation with mutation handle, later to be applied.' + _;

      	// You must now run safeMutableData.applyEntriesMutation(mdHandle, mutationHandle) to save changes
    },

    free: () => {
      window.safeMutableDataMutation.free(mutationHandle);
      mutationHandle = null;
      return;
    },

  }
}
