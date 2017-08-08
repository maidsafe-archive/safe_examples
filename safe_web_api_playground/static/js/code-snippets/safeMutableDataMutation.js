module.exports = {
  safeMutableDataMutation: {
    insert: () => {
      // Use safeMutableData.newMutation to obtain mutationHandle

      return window.safeMutableDataMutation.insert(mutationHandle, 'key1', 'value1')
      .then(_ => {
        return 'Registers an insert operation with mutation handle, later to be applied.' + _;

        // You must now run safeMutableData.applyEntriesMutation(mdHandle, mutationHandle) to save changes.
      });
    },

    remove: () => {
      // Use safeMutableData.newMutation to obtain mutationHandle

      return window.safeMutableDataMutation.remove(mutationHandle, 'key1', value.version + 1)
      .then(_ => {
      	return 'Registers a remove operation with mutation handle, later to be applied.' + _;

      	// You must now run safeMutableData.applyEntriesMutation(mdHandle, mutationHandle) to save changes
      });
    },

    update: () => {
      // Use safeMutableData.newMutation to obtain mutationHandle

      return window.safeMutableDataMutation.update(mutationHandle, 'key1', 'newValue', value.version + 1)
      .then(_ => {
      	return 'Registers an update operation with mutation handle, later to be applied.' + _;

      	// You must now run safeMutableData.applyEntriesMutation(mdHandle, mutationHandle) to save changes
      });
    },

    free: () => {
      window.safeMutableDataMutation.free(mutationHandle);
      mutationHandle = null;
      return;
    },

  }
}
