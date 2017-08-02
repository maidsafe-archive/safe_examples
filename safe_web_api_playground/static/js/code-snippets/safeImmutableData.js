module.exports = {
  safeImmutableData: {
    create: () => {
      return window.safeImmutableData.create(appHandle)
      .then((res) => {
      	idWriterHandle = res;
      	return 'ImmutableData writer handle: ' + res;
      });
    },

    write: () => {
      // Where does idWriterHandle come from?
      // Run safeImmutableData.create first to obtain it.

      // After running this function, you have to use safeImmutableData.closeWriter to save data to the network
      return window.safeImmutableData.write(idWriterHandle, 'my immutable data')
      .then(_ => {
      	return 'Data written, still needs to be saved using safeImmutableData.closeWriter';
      })
    },

    closeWriter: () => {
      return window.safeImmutableData.closeWriter(idWriterHandle, cipherOptHandle)
      .then((res) => {
      	idAddress = res;
      	return 'ImmutableData was stored at address: ' + res;
      });
    },

    fetch: () => {
      // idAddress argument is a buffer address to an ImmutableData structure
      // Use safeImmutableData.closeWriter to obtain idAddress

      return window.safeImmutableData.fetch(appHandle, idAddress)
      .then((res) => {
      	idReaderHandle = res;
      	return 'Return ImmutableData reader handle: ' + res;
      });
    },

    read: () => {
      return window.safeImmutableData.read(idReaderHandle)
      .then((data) => {
      	return 'Returns ImmutableData data: ' + String.fromCharCode.apply(null, new Uint8Array(data));
      });
    },

    size: () => {
      return window.safeImmutableData.size(idReaderHandle)
      .then((size) => {
      	return 'Size of the ImmutableData data: ' + size;
      });
    },

    free: () => {
      window.safeImmutableData.free(idReaderHandle);
      idReaderHandle = null;
      return;
    },

  }
}
