module.exports = {
  safeNfsFile: {
    size: async () => {
      let fileSize = null;
      try {
        fileSize = await window.safeNfsFile.size(fileContextHandle)
      } catch(err) {
        return err;
      }
      return `file size in bytes: ${filesize}`;
    },

    read: async () => {
      //  Read the file from the beginning.
      const FILE_READ_FROM_BEGIN = 0;

      //  Read entire contents of a file.
      const FILE_READ_TO_END = 0;

      const position = FILE_READ_FROM_BEGIN;
      const len = FILE_READ_TO_END;
      try {
       var data = await window.safeNfsFile.read(fileContextHandle, position, len)
      } catch(err) {
        return err;
      }
      return `${String.fromCharCode.apply(null, data)}`;
    },

    write: async () => {
      let content = 'file content may be a string';
      try {
        await window.safeNfsFile.write(fileContextHandle, content)
      } catch(err) {
        return err;
      }
        return 'File content written but still needs to be saved to the network.';
    },

    close: async () => {
      try {
        await window.safeNfsFile.close(fileContextHandle)
      } catch(err) {
        return err;
      }
        return 'File closed and committed to the network, if not previsouly!';
    },

    metadata: async () => {
      try {
        var metaData = await window.safeNfsFile.metadata(fileContextHandle)
      } catch(err) {
        return err;
      }
        return `Returns file meta data: ${JSON.stringify(metaData)}`;
    },

    free: () => {
      window.safeNfsFile.free(fileContextHandle);
      fileContextHandle = null;
      return;
    }
  }
}
