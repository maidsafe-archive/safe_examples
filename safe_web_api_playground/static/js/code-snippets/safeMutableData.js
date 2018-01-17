module.exports = {
  safeMutableData: {
    newRandomPrivate: async () => {
      try {
        mdHandle = await window.safeMutableData.newRandomPrivate(appHandle, 15001)
      } catch(err) {
        return err;
      }
      return `Returns handle to newly created, private, randomly named MutableData structure: ${mdHandle}`;
    },

    newRandomPublic: async () => {
      try {
        mdHandle = await window.safeMutableData.newRandomPublic(appHandle, 15001)
      } catch(err) {
        return err;
      }
      return `Returns handle to newly created, public, randomly named MutableData structure: ${mdHandle}`;
    },

    newPrivate: async () => {
      // Generate nonce with generated with safeCrypto.generateNonce

      // hashedString and secKey must be 32 bytes.
      // You can use safeCrypto.sha3Hash to generate a 32 byte hash based on the string you input

      // Why a secret key? It's used to encrypt data.

      let secKey = 'secret-key-010101010101010101010';

      try {
        mdHandle = await window.safeMutableData.newPrivate(appHandle, hashedString, 15001, secKey, nonce)
      } catch(err) {
        return err;
      }
      return `Returns handle to newly created or already existing, private, explicitly named Mutable Data structure: ${mdHandle}`;
    },

    newPublic: async () => {
      // hashedString must be 32 bytes.
      // You can use safeCrypto.sha3Hash to generate a 32 byte hash based on the string you input

      try {
       mdHandle = await window.safeMutableData.newPublic(appHandle, hashedString, 15001)
      } catch(err) {
        return err;
      }
      return `Returns handle to newly created or already existing, public, explicitly named Mutable Data structure: ${mdHandle}`;
    },

    newPermissions: async () => {
      // This function and it's return value correspond to safeMutableDataPermissions functions
      try {
        permsHandle = await window.safeMutableData.newPermissions(appHandle)
      } catch(err) {
        return err;
      }
      return `Newly created permissions handle returned: ${permsHandle}`;
    },

    newMutation: async () => {
      // This function and it's return value correspond to safeMutableDataMutation functions
      try {
        mutationHandle = await window.safeMutableData.newMutation(appHandle)
      } catch(err) {
        return err;
      }
      return `Returns handle to be able to call safeMutableDataMutation functions: ${mutationHandle}`;
    },

    newEntries: async () => {
      try {
        entriesHandle = await window.safeMutableData.newEntries(appHandle)
      } catch(err) {
        return err;
      }
      return `Returns an entries handle to be used with safeMutableDataEntries functions: ${entriesHandle}`;
    },

    quickSetup: async () => {
      try {
        mdHandle = await window.safeMutableData.quickSetup(mdHandle, {key1: 'value1'});
      } catch (err) {
        return err;
      }
      return `Returns mdHandle: ${mdHandle}`;
    },

    encryptKey: async () => {
    try {
      encryptedKey = await window.safeMutableData.encryptKey(mdHandle, 'key1')
    } catch(err) {
      return err;
    }
     return `Encrypted key: ${encryptedKey}`;
    },

    encryptValue: async () => {
      try {
        encryptedValue = await window.safeMutableData.encryptValue(mdHandle, 'value1')
      } catch(err) {
        return err;
      }
       return `Encrypted value: ${encryptedValue}`;
    },

    decrypt: async () => {
      // `value` argument can be either encryptedValue or encryptedKey
      try {
        decryptedValue = await window.safeMutableData.decrypt(mdHandle, value)
      } catch(err) {
        return err;
      }
      return `Decrypted key: ${String.fromCharCode.apply(null, new Uint8Array(decryptedValue))}`;
    },

    getNameAndTag: async () => {
      try {
        var nameAndTag = await window.safeMutableData.getNameAndTag(mdHandle)
	mdName = nameAndTag.name.buffer;
      } catch(err) {
        return err;      
      }
      return `Name: ${String.fromCharCode.apply(null, new Uint8Array(nameAndTag.name.buffer))}, Tag: ${nameAndTag.type_tag}`;
    },

    getVersion: async () => {
    try {
      version = await window.safeMutableData.getVersion(mdHandle)
    } catch(err) {
      return err; 
    }
    return `MutableData current version: ${version}`;
    },

    get: async () => {
     // get entry valuefrom mutable data by key
      try {
        var value = await window.safeMutableData.get(mdHandle, 'key1')
      } catch(err) {
        return err;
      }
      return `Value: ${String.fromCharCode.apply(null, new Uint8Array(value.buf))}, Version: ${value.version}`;
    },

    put: async () => {
      await window.safeMutableData.put(mdHandle, permsHandle, entriesHandle)
      return 'Finished creating and committing MutableData to the network';
    },

    getEntries: async () => {
      // This function returns a handle that will allow you to use the safeMutableDataEntries module below.
      try {
        entriesHandle = await window.safeMutableData.getEntries(mdHandle)
      } catch(err) {
        return err;
      }
      return `Returns handle for safeMutableDataEntries operations: ${entriesHandle}`;
    },

    getKeys: async () => {
      try {
        var keysArray = await window.safeMutableData.getKeys(mdHandle);
      } catch (err) {
        return err;
      }
      return `Returns array of entry keys: ${keysArray}`;
    },

    getValues: async () => {
      try {
        const valuesArray = await window.safeMutableData.getValues(mdHandle);
	var readableString = valuesArray.map(valueObject => String.fromCharCode.apply(null, valueObject.buf));
      } catch(err) {
        return err; 
      }
      return `Returns array of entry values: ${readableString}`;
    },

    getPermissions: async () => {
      try {
        permsHandle = await window.safeMutableData.getPermissions(mdHandle)
      } catch(err) {
        return err;
      }
      return `Returns handle to operate on safeMutableDataPermissions: ${permsHandle}`;
    },

    getUserPermissions: async () => {
      // First use safeCrypto.getAppPubSignKey to obtain signKeyHandle
      try {
        permsHandle = await window.safeMutableData.getUserPermissions(mdHandle, signKeyHandle)
      } catch(err) {
        return err;
      }
      return `Returns handle to operate on safeMutableDataPermissions: ${permsHandle}`;
    },

    delUserPermissions: async () => {
      try {
        await window.safeMutableData.delUserPermissions(mdHandle, signKey, version + 1)
      } catch(err) {
        return err; 
      }
      return `Permissions-Set removed for the sign key provided`;
    },

    setUserPermissions: async () => {
      try {
        await window.safeMutableData.setUserPermissions(mdHandle, signKeyHandle, permSetHandle, version + 1)
      } catch(err) {
        return err;
      }
      return 'Finished setting user permission';
    },

    applyEntriesMutation: async () => {
      // Use safeMutableData.newMutation to obtain mutationHandle
      try {
       await window.safeMutableData.applyEntriesMutation(mdHandle, mutationHandle)
      } catch(err) {
        return err;
      }
      return 'New entry was inserted in the MutableData and committed to the network';
    },

    serialise: async () => {
    try {
      serialisedMD = await window.safeMutableData.serialise(mdHandle)
    } catch(err) {
      return err;
    }
    return `MutableData serialised version output: ${serialisedMD}`;
    },

    fromSerial: async () => {
      try {
        mdHandle = await window.safeMutableData.fromSerial(appHandle, serializedMD)
      } catch(err) {
        return err;
      }
       return `Returns handle to MutableData: ${mdHandle}`;
    },

    emulateAs: async () => {
      // Wrap this MutableData into a known abstraction. Currently known: NFS
      // The returned nfsHandle will allow you to use safeNfs functions
      try {
        nfsHandle = await window.safeMutableData.emulateAs(mdHandle, 'NFS')
      } catch(err) {
        return err;
      }
      return `Returns nfsHandle: ${nfsHandle}`;
    }
  }
}
