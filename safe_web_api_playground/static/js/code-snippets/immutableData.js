module.exports = {
  immutableData: {
    fetch: async () => {
      // iDataAddress argument is a buffer address to an ImmutableData structure
      // Use iDataWriter.closeWriter to obtain idAddress
      try {
        iDataReader = await app.immutableData.fetch(iDataAddress);
      } catch(err) {
        return err;
      }
      return `Return ImmutableData reader interface: ${iDataReader}`;
    },

    create: async () => {
      try {
        iDataWriter = await app.immutableData.create()
      } catch(err) {
        return err;
      }
      return `ImmutableData writer interface: ${iDataWriter}`;
    },

    write: async () => {
      // Where does iDataWriter come from?
      // Run safeImmutableData.create first to obtain it.

      // After running this function, you must use the iDataWriter.closeWriter snippet to save data to the network
      try {
        await iDataWriter.write('my immutable data')
      } catch (err) {
        return err;
      }
      return 'Data written, still needs to be saved using safeImmutableData.closeWriter';
    },

    closeWriter: async () => {
      const getXorUrl = true; // Experimental feature
      const mimeType = 'text/plain';
      try {
        iDataAddress = await iDataWriter.close(cipherOpt, getXorUrl, mimeType)
      } catch(err) {
        return err;
      }
      iDataWriter = null;
      if ( getXorUrl ) {
          return `ImmutableData was stored at address: ${iDataAddress.name} and can be fetched via it's XOR-URL: ${iDataAddress.xorUrl}`;
      } else {
          return `ImmutableData was stored at address: ${iDataAddress}`;
      }
    },

    read: async () => {
      const readOptions =
      {
        offset: 0, // starts reading from this byte position
        end: null // ends reading at this byte position
      };
      try {
        var data = await iDataReader.read(readOptions)
      } catch(err) {
        return err;
      }
      return `Returns ImmutableData data: ${data}`;
    },

    size: async () => {
      try {
        var size = await iDataReader.size()
      } catch(err) {
        return err;
      }
      return `Size of the ImmutableData data: ${size} bytes`;
    }
  }
}
