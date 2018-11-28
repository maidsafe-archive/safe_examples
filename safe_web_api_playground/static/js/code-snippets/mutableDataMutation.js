module.exports = {
  mutableDataMutation: {
    insert: async () => {
      try {
        await mutation.insert('key1', 'value1')
      } catch(err) {
        return err;
      }
      return 'Registers an insert operation with mutation interface, later to be applied.';

      // You must now run mData.applyEntriesMutation(mutation) to commit changes
    },

    delete: async () => {
      try {
        // First run mData.get('key1') to obtain value
        await mutation.delete('key1', value.version + 1)
      } catch(err) {
        return err;
      }
      return 'Registers a delete operation with mutation interface, later to be applied.' + _;

      // You must now run mData.applyEntriesMutation(mutation) to commit changes
    },

    update: async () => {
      try {
        // First run mData.get('key1') to obtain value
        await mutation.update('key1', 'newValue', value.version + 1)
      } catch(err) {
        return err;
      }

      	return 'Registers an update operation with mutation interface, later to be applied.' + _;

        // You must now run mData.applyEntriesMutation(mutation) to commit changes
    }
  }
}
