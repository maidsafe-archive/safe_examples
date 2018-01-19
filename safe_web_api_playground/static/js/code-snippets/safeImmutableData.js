module.exports = {
  safeImmutableData: {
    create: async () => {
      try {
        idWriterHandle = await window.safeImmutableData.create(appHandle)
      } catch(err) {
        return err;
      }
      return `ImmutableData writer handle: ${idWriterHandle}`;
    },

    write: async () => {
      // Where does idWriterHandle come from?
      // Run safeImmutableData.create first to obtain it.

      // After running this function, you have to use safeImmutableData.closeWriter to save data to the network
      try {
        await window.safeImmutableData.write(idWriterHandle, 'my immutable data')
      } catch (err) {
        return err;
      }
      return 'Data written, still needs to be saved using safeImmutableData.closeWriter';
    },

    closeWriter: async () => {
      try {
        idAddress = await window.safeImmutableData.closeWriter(idWriterHandle, cipherOptHandle)
      } catch(err) {
        return err;
      }
      return `ImmutableData was stored at address: ${idAddress}`;
    },

    fetch: async () => {
      // idAddress argument is a buffer address to an ImmutableData structure
      // Use safeImmutableData.closeWriter to obtain idAddress
      try {
        idReaderHandle = await window.safeImmutableData.fetch(appHandle, idAddress)
      } catch(err) {
        return err;
      }
      return `Return ImmutableData reader handle: ${idReaderHandle}`;
    },

    read: async () => {
      try {
        var data = await window.safeImmutableData.read(idReaderHandle)
      } catch(err) {
        return err;
      }
      return `Returns ImmutableData data: ${String.fromCharCode.apply(null, data)}`;
    },

    size: async () => {
      try {
        var size = await window.safeImmutableData.size(idReaderHandle)
      } catch(err) {
        return err;
      }
      return `Size of the ImmutableData data: ${size} bytes`;
    },

    free: () => {
      window.safeImmutableData.free(idReaderHandle);
      idReaderHandle = null;
      return;
    },

  }
}
