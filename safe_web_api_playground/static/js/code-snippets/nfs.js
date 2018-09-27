module.exports = {
  nfs: {
    create: async () => {
      // Where does nfs come from?
      // Use mData.emulateAs to generate nfsHandle

      // fileContent can either be a string or a file buffer.
      // Choose a file and then use the line of code directly below to retreive file buffer.
      const fileContent = window.fileContent;
      try {
        fileContext = await nfs.create(fileContent);
      } catch(err) {
        return err;
      }
        return `Returns file context object: ${fileContext}`;
    },

    fetch: async () => {
      // fileName: (String) the path/file name

      const fileName = 'index.html';
      try {
        fileContext = await nfs.fetch(fileName);
      } catch(err) {
        return err;
      }
        return `Returns file context object: ${fileContext}`;
    },

    insert: async () => {
      const fileName = 'index.html';
      const userMetaData = 'Arbitrary meta data';
      try {
        fileContext = await nfs.insert(fileName, fileContext, userMetaData);
      } catch(err) {
        return err;
      }
        return `Returns file context object: ${fileContext}`;
    },

    update: async () => {
      const fileName = 'index.html';
      const userMetaData = 'Updated arbitrary meta data';
      try {
        fileContext = await nfs.update(fileName, fileContext, version, userMetaData);
      } catch(err) {
        return err;
      }
        return `Returns file context object: ${fileContext}`;
    },


    delete: async () => {
      try {
        await nfs.delete(fileName, version);
      } catch(err) {
        return err;
      }
        return 'File deleted from network';
    },

    open: async () => {
      //  Replaces the entire content of the file when writing data.
      // Use this to open a new file for writing
      const OPEN_MODE_OVERWRITE = 1;

      //  Appends to existing data in the file.
      const OPEN_MODE_APPEND = 2;

      //  Open file to read.
      const OPEN_MODE_READ = 4;

      const openMode = OPEN_MODE_READ;
      try {
        fileContext = await nfs.open(fileContext, openMode);
      } catch(err) {
        return err;
      }
      return `Returns same file context handle: ${fileContext}`;
    }
  }
}
