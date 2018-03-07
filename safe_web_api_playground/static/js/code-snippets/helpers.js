module.exports = {
  helpers: {
    uploadDirectory: async () => {

      // Open up your console to view names of uploaded files
      console.log("Starting upload...");
      console.time("upload-time");
      const directory = document.getElementById('dirExplorer').files;
      console.log(directory);

      await Array.prototype.forEach.call(directory, async (file) => {
        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
          const fileBuffer = new Buffer(event.target.result);
	  console.log('file buffer: ', fileBuffer);
          const fileContextHandle = await window.safeNfs.create(nfsHandle, fileBuffer);
	  console.log('file handle: ', fileContextHandle);
          await window.safeNfs.insert(nfsHandle, fileContextHandle, file.webkitRelativePath.split('/').slice(1).join('/'))
          await window.safeNfsFile.free(fileContextHandle)
          console.log(directory[i].webkitRelativePath.split('/').slice(1).join('/') + ' saved. ');
        }
	console.log(file);
        fileReader.readAsArrayBuffer(file);
      });

      console.log("Upload complete.");
      const duration = console.timeEnd("upload-time");
      return `Upload Complete. Duration: ${duration}`
    },

    getDirectory: () => {
      return window.safeMutableData.getKeys(mdHandle)
      .then((res) => {
        keysHandle = res;

        return window.safeMutableDataKeys.forEach(keysHandle, (k) => {

          this.send('forEachResult', String.fromCharCode.apply(null, k));

        }).then(_ => {
          let forEachResultsCopy = forEachResults.slice(0);
          forEachResults.splice(0);

          function getDirQueue(i) {
            if( i == forEachResultsCopy.length) {
              return new Promise((resolve, reject) => {
                return resolve('forEachResults variable loaded with ' + forEachResults.length + ' file meta data objects.');
              });
            } else {
              return window.safeNfs.fetch(nfsHandle, forEachResultsCopy[i])
              .then(res => {
                fileHandle = res;
                return window.safeNfs.getFileMeta(fileHandle)
                .then(metaData => {
                  forEachResults.push(metaData);

                  return window.safeNfs.freeFile(fileHandle)
                  .then(_ => {
                    fileHandle = null;
                    console.log(directory[i].webkitRelativePath.split('/').slice(1).join('/') + ' deleted. ');
                    return getDirQueue( i + 1);
                  });
                });
              });
            }
          }

          return getDirQueue(0).then(res => {
            console.log(res);
            return res;
          });

        });
      });
    },

    delDirectory: () => {
      let forEachResultsCopy = forEachResults.slice(0);
      forEachResults.splice(0);

      function delDirQueue(i) {
        if( i == forEachResultsCopy.length) {
          return new Promise((resolve, reject) => {
            return resolve('Deleted ' + forEachResultsCopy.length + ' files.' );
          });
        } else {
          return window.safeMutableData.get(mdHandle, forEachResultsCopy[i])
          .then((value) => {
            return window.safeMutableDataMutation.remove(mutationHandle, forEachResultsCopy[i], value.version + 1)
            .then(_ => {
            	console.log( forEachResultsCopy[i] + ' deleted. ');
              return delDirQueue( i + 1);
            });
          })
        }
      }

      return delDirQueue(0).then(res => {
        console.log(res);
        return res;
      });
    }
  }
}
