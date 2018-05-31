module.exports = {
  nfsFile: {
    size: async () => {
      let fileSize = null;
      try {
        fileSize = await fileContext.size(fileContextHandle)
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
       var data = await fileContext.read(fileContextHandle, position, len)
      } catch(err) {
        return err;
      }
      return `${data}`;
    },

    write: async () => {
      let content = 'file content may be a string';
      try {
        await fileContext.write(fileContextHandle, content)
      } catch(err) {
        return err;
      }
        return 'File content written but still needs to be saved to the network.';
    },

    close: async () => {
      try {
        await fileContext.close(fileContextHandle)
      } catch(err) {
        return err;
      }
        return 'File closed and committed to the network, if not previously!';
    },

    metadata: async () => {
      try {
        var metaData = await fileContext.metadata(fileContextHandle)
      } catch(err) {
        return err;
      }
        return `Returns file meta data: ${JSON.stringify(metaData)}`;
    }
  }
}
