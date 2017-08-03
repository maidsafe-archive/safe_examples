module.exports = {
  safeNfs: {
    create: () => {
      // Where does nfsHandle come from?
      // Use safeMutableData.emulateAs to generate nfsHandle

      // fileContent can either be a string or a file buffer.
      // Choose a file and then use the line of code directly below to retreive file buffer.
      let fileContent = window.fileContent;

      return window.safeNfs.create(nfsHandle, fileContent)
      .then((res) => {
        fileContextHandle = res;

        return 'Returns the file handle of a newly created file: ' + res;
      });

    },

    fetch: () => {
      // fileName: (String) the path/file name

      let fileName = 'index.html';
      return window.safeNfs.fetch(nfsHandle, fileName)
      .then(res => {
      	fileContextHandle = res;

      	return 'Returns file context handle: ' + res;
      });
    },

    insert: () => {
      let fileName = 'index.html';
      return window.safeNfs.insert(nfsHandle, fileContextHandle, fileName)
      .then(res => {
      	fileContextHandle = res;

      	return 'Returns same file context handle: ' + res;
      });
    },

    update: () => {
      return window.safeNfs.update(nfsHandle, fileContextHandle, fileName, version)
      .then(res => {
      	fileContextHandle = res;

      	return 'Returns the same file context handle: ' + res;
      });
    },


    delete: () => {
      return window.safeNfs.delete(nfsHandle, fileName, version)
      .then(_ => {
        return 'File deleted from network';
      });
    },

    open: () => {
      //  Replaces the entire content of the file when writing data.
      // Use this to open a new file for writing
      let OPEN_MODE_OVERWRITE = 1;

      //  Appends to existing data in the file.
      let OPEN_MODE_APPEND = 2;

      //  Open file to read.
      let OPEN_MODE_READ = 4;

      let openMode = OPEN_MODE_READ;
      return window.safeNfs.open(nfsHandle, fileContextHandle, openMode)
      .then(res => {
        fileContextHandle = res;

        return 'Returns handle to file context: ', res;
      });
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
