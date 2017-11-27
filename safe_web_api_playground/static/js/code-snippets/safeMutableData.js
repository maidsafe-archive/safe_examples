module.exports = {
  safeMutableData: {
    newRandomPrivate: () => {
      return window.safeMutableData.newRandomPrivate(appHandle, 15001)
      .then((res) => {
      	mdHandle = res;
      	return 'Returns handle to newly created, private, randomly named MutableData structure: ' + res;
      });
    },

    newRandomPublic: () => {
      return window.safeMutableData.newRandomPublic(appHandle, 15001)
      .then((res) => {
      	mdHandle = res;
      	return 'Returns handle to newly created, public, randomly named MutableData structure: ' + res;
      });
    },

    newPrivate: () => {
      // Generate nonce with generated with safeCrypto.generateNonce

      // name and secKey must be 32 bytes.
      // You can use safeCrypto.sha3Hash to generate a 32 byte hash based on the string you input

      let name = 'name-private-0101010101010101010';
      let secKey = 'secret-key-010101010101010101010';

      return window.safeMutableData.newPrivate(appHandle, name, 15001, secKey, nonce)
      .then((res) => {
      	mdHandle = res;
      	return 'Returns handle to newly created or already existing, private, explicitly named Mutable Data structure: ' + res;
      })
    },

    newPublic: () => {
      // name must be 32 bytes.
      // You can use safeCrypto.sha3Hash to generate a 32 byte hash based on the string you input

      let name = 'name-public-01010101010101010101';
      return window.safeMutableData.newPublic(appHandle, name, 15001)
      .then((res) => {
      	mdHandle = res;
      	return 'Returns handle to newly created or already existing, public, explicitly named Mutable Data structure: ' + res;
      });
    },

    newPermissions: () => {
      // This function and it's return value correspond to safeMutableDataPermissions functions

      return window.safeMutableData.newPermissions(appHandle)
      .then((res) => {
      	permsHandle = res;
      	return 'Newly created permissions handle returned: ' + res;
      });
    },

    newMutation: () => {
      // This function and it's return value correspond to safeMutableDataMutation functions

      return window.safeMutableData.newMutation(appHandle)
      .then((res) => {
      	mutationHandle = res;
      	return 'Returns handle to be able to call safeMutableDataMutation functions: ' + res;
      });
    },

    newEntries: () => {
      return window.safeMutableData.newEntries(appHandle)
      .then((res) => {
      	entriesHandle = res;
      	return 'Returns an entries handle to be used with safeMutableDataEntries functions: ' + res;
      });
    },

    quickSetup: async () => {
      try {
        mdHandle = await window.safeMutableData.quickSetup(mdHandle, {key1: 'value1'});
      } catch (err) {
        return err;
      }
      return `Returns mdHandle: ${mdHandle}`;
    },

    encryptKey: () => {
      return window.safeMutableData.encryptKey(mdHandle, 'key1')
      .then((res) => {
      	encryptedKey = res;
      	return 'Encrypted key: ' + res;
      });
    },

    encryptValue: () => {
      return window.safeMutableData.encryptValue(mdHandle, 'value1')
      .then((res) => {
      	encryptedValue = res;
      	return 'Encrypted value: ' + res;
      });
    },

    decrypt: () => {
      // `value` argument can be either encryptedValue or encryptedKey

      return window.safeMutableData.decrypt(mdHandle, value)
      .then((decryptedValue) => {
      	return 'Decrypted key: ' + String.fromCharCode.apply(null, new Uint8Array(decryptedValue));
      })
    },

    getNameAndTag: () => {
      return window.safeMutableData.getNameAndTag(mdHandle)
      .then((res) => {
        mdName = res.name.buffer;
      	return 'Name: ' + String.fromCharCode.apply(null, new Uint8Array(res.name.buffer)) + ', Tag: ' + res.tag;
      });
    },

    getVersion: () => {
      return window.safeMutableData.getVersion(mdHandle)
      .then((res) => {
        version = res;
      	return 'MutableData current version: ' + res;
      });
    },

    get: () => {
      return window.safeMutableData.get(mdHandle, 'key1')
      .then((value) => {
      	return 'Value: ' + String.fromCharCode.apply(null, new Uint8Array(value.buf)) + ', Version: ' + value.version;
      })
    },

    put: () => {
      return window.safeMutableData.put(mdHandle, permsHandle, entriesHandle)
      .then(_ => {
      	return 'Finished creating and committing MutableData to the network' + _;
      });
    },

    getEntries: () => {
      // This function returns a handle that will allow you to use the safeMutableDataEntries module below.

      return window.safeMutableData.getEntries(mdHandle)
      .then((res) => {
      	entriesHandle = res;
      	return 'Returns handle for safeMutableDataEntries operations: ' + res;
      });
    },

    getKeys: async () => {
      const keysArray = await window.safeMutableData.getKeys(mdHandle);
      return `Returns array of entry keys: ${keysArray}`;
    },

    getValues: () => {
      const valuesArray = window.safeMutableData.getValues(mdHandle);
      return `Returns array of entry values: ${valuesArray}`;
    },

    getPermissions: () => {
      return window.safeMutableData.getPermissions(mdHandle)
      .then((res) => {
      	permsHandle = res;
      	return 'Returns handle to operate on safeMutableDataPermissions: ' + res;
      });
    },

    getUserPermissions: () => {
      // First use safeCrypto.getAppPubSignKey to obtain signKeyHandle

      return window.safeMutableData.getUserPermissions(mdHandle, signKeyHandle)
      .then((res) => {
      	permSetHandle = res;
      	return 'Returns handle to operate on safeMutableDataPermissionsSet: ' + res;
      });
    },

    delUserPermissions: () => {
      return window.safeMutableData.delUserPermissions(mdHandle, signKey, version + 1)
      .then(_ => {
      	return 'PermissionsSet removed for the sign key provided';
      });
    },

    setUserPermissions: () => {
      return window.safeMutableData.setUserPermissions(mdHandle, signKeyHandle, permSetHandle, version + 1)
      .then(_ => {
      	return 'Finished setting user permission';
      });
    },

    applyEntriesMutation: () => {
      // Use safeMutableData.newMutation to obtain mutationHandle

      return window.safeMutableData.applyEntriesMutation(mdHandle, mutationHandle)
      .then(_ => {
      	return 'New entry was inserted in the MutableData and committed to the network' + _;
      });
    },

    serialise: () => {
      return window.safeMutableData.serialise(mdHandle)
      .then((res) => {
      	serializedMD = res;
      	return 'MutableData serialised version retrieved: ' + res;
      });
    },

    fromSerial: () => {
      return window.safeMutableData.fromSerial(appHandle, serializedMD)
      .then((res) => {
      	mdHandle = res;
      	return 'Returns handle to MutableData: ' + res;
      });
    },

    emulateAs: () => {
      // Wrap this MutableData into a known abstraction. Currently known: NFS
      // The returned nfsHandle will allow you to use safeNfs functions

      return window.safeMutableData.emulateAs(mdHandle, 'NFS')
      .then((res) => {
      	nfsHandle = res;
      	return 'Returns nfsHandle: ' + res;
      });
    }
  }
}
