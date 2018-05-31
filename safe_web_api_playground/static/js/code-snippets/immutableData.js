module.exports = {
  immutableData: {
    fetch: async () => {
      // idAddress argument is a buffer address to an ImmutableData structure
      // Use idWriter.closeWriter to obtain idAddress
      try {
        idReader = await app.immutableData.fetch(idAddress)
      } catch(err) {
        return err;
      }
      return `Return ImmutableData reader handle: ${idReader}`;
    },

    create: async () => {
      try {
        idWriter = await app.immutableData.create()
      } catch(err) {
        return err;
      }
      return `ImmutableData writer interface: ${idWriter}`;
    },

    write: async () => {
      // Where does idWriter come from?
      // Run safeImmutableData.create first to obtain it.

      // After running this function, you must use idWriter.closeWriter to save data to the network
      try {
        await idWriter.write('my immutable data')
      } catch (err) {
        return err;
      }
      return 'Data written, still needs to be saved using safeImmutableData.closeWriter';
    },

    closeWriter: async () => {
      try {
        idAddress = await idWriter.close(cipherOpt)
      } catch(err) {
        return err;
      }
      idWriter = null;
      return `ImmutableData was stored at address: ${idAddress}`;
    },

    read: async () => {
      const readOptions =
      {
        offset: 0, // starts reading from this byte position
        end: null // ends reading at this byte position
      };
      try {
        var data = await idReader.read(readOptions)
      } catch(err) {
        return err;
      }
      return `Returns ImmutableData data: ${data}`;
    },

    size: async () => {
      try {
        var size = await idReader.size()
      } catch(err) {
        return err;
      }
      return `Size of the ImmutableData data: ${size} bytes`;
    }
  }
}
