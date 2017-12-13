module.exports = {
  safeNfs: {
    create: async () => {
      // Where does nfsHandle come from?
      // Use safeMutableData.emulateAs to generate nfsHandle

      // fileContent can either be a string or a file buffer.
      // Choose a file and then use the line of code directly below to retreive file buffer.
      const fileContent = window.fileContent;
      try {
        fileContextHandle = await window.safeNfs.create(nfsHandle, fileContent)
      } catch(err) {
        return err;
      }
        return `Returns the file handle of a newly created file: ${fileContextHandle}`;
    },

    fetch: async () => {
      // fileName: (String) the path/file name

      const fileName = 'index.html';
      try {
        fileContextHandle = await window.safeNfs.fetch(nfsHandle, fileName)
      } catch(err) {
        return err;
      }
        return `Returns the file handle: ${fileContextHandle}`;
    },

    insert: async () => {
      const fileName = 'index.html';
      try {
        fileContextHandle = await window.safeNfs.insert(nfsHandle, fileContextHandle, fileName)
      } catch(err) {
        return err;
      }
        return `Returns same file handle: ${fileContextHandle}`;
    },

    update: async () => {
      try {
        fileContextHandle = await window.safeNfs.update(nfsHandle, fileContextHandle, fileName, version)
      } catch(err) {
        return err;
      }
        return `Returns same file handle: ${fileContextHandle}`;
    },


    delete: async () => {
      try {
        await window.safeNfs.delete(nfsHandle, fileName, version)
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
        fileContextHandle = await window.safeNfs.open(nfsHandle, fileContextHandle, openMode)
      } catch(err) {
        return err;
      }
      return `Returns same file context handle: ${fileContextHandle}`;
    },

    free: () => {
      window.safeNfs.free(nfsHandle);
      nfsHandle = null;
      return;
    }

  }
}

// let regexObj = new RegExp('^' + 'js');
// if(regexObj.test(k)) {
//    let key = String.fromCharCode.apply(null, k);
//    let value = String.fromCharCode.apply(null, new Uint8Array(v.buf));
//    console.log('Key: ' + key + ', ' + 'Value: ' + value);
//  }
