module.exports = {
  nfsFile: {
    size: async () => {
      try {
        var fileSize = await fileContext.size();
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
       var data = await fileContext.read(position, len);
      } catch(err) {
        return err;
      }
      return `${data}`;
    },

    write: async () => {
      let content = 'file content may be a string';
      try {
        await fileContext.write(content);
      } catch(err) {
        return err;
      }
        return 'File content written but still needs to be saved to the network.';
    },

    close: async () => {
      try {
        await fileContext.close();
      } catch(err) {
        return err;
      }
        return 'File closed and committed to the network, if not previously!';
    },

    metadata: async () => {
      try {
        var metaData = await fileContext.userMetadata;
      } catch(err) {
        return err;
      }
        return `Returns file meta data: ${metaData.toString()}`;
    }
  }
}
