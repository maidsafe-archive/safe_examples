module.exports = {
  safeNfsFile: {
    size: () => {
      return window.safeNfsFile.size(fileContextHandle)
      .then(fileSize => {
        return 'file size in bytes: ' + filesize;
      })
    },

    read: () => {
      //  Read the file from the beginning.
      let FILE_READ_FROM_BEGIN = 0;

      //  Read entire contents of a file.
      const FILE_READ_TO_END = 0;

      let position = FILE_READ_FROM_BEGIN;
      let len = FILE_READ_TO_END;
      
      return window.safeNfsFile.read(fileContextHandle, position, len)
      .then(data => {
        return String.fromCharCode.apply(null, new Uint8Array(data));
      })
    },

    write: () => {
      let content = 'file content may be a string';
      return window.safeNfsFile.write(fileContextHandle, content)
      .then(_ => {
        return 'File content written but still needs to be saved to the network.';
      })
    },

    close: () => {
      return window.safeNfsFile.close(fileContextHandle)
      .then(_ => {
        return 'File committed to the network!';
      })
    },

    metadata: () => {
      return window.safeNfsFile.metadata(fileContextHandle)
      .then(metaData => {
        return 'Returns file meta data: ' + metaData;
      })
    },

    free: () => {
      return window.safeNfsFile.free(fileContextHandle)
      .then(_ => {
        fileContextHandle = null;
        return 'fileContextHandle freed from memory';
      });
    }
  }
}
