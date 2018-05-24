module.exports = {
  mutableData: {
    newRandomPrivate: async () => {
      try {
        mData = await app.mutableData.newRandomPrivate(15001)
      } catch(err) {
        return err;
      }
      return `Returns interface to newly created, private, randomly named MutableData structure: ${mData}`;
    },

    newRandomPublic: async () => {
      try {
        mData = await app.mutableData.newRandomPublic(15001)
      } catch(err) {
        return err;
      }
      return `Returns interface to newly created, public, randomly named MutableData structure: ${mData}`;
    },

    newPrivate: async () => {
      // Generate nonce with generated with safeCrypto.generateNonce

      // hashedString and secKey must be 32 bytes.
      // You can use safeCrypto.sha3Hash to generate a 32 byte hash based on the string you input

      // Why a secret key? It's used to encrypt entries.

      const secKey = rawSecEncKey.buffer;

      try {
        mData = await app.mutableData.newPrivate(hashedString, 15001, secKey, nonce.buffer)
      } catch(err) {
        return err;
      }
      return `Returns interface to newly created or already existing, private, explicitly named Mutable Data structure: ${mData}`;
    },

    newPublic: async () => {
      // hashedString must be 32 bytes.
      // You can use safeCrypto.sha3Hash to generate a 32 byte hash based on the string you input

      try {
       mData = await app.mutableData.newPublic(hashedString, 15001)
      } catch(err) {
        return err;
      }
      return `Returns interface to newly created or already existing, public, explicitly named Mutable Data structure: ${mData}`;
    },

    newPermissions: async () => {
      // This function and it's return value correspond to safeMutableDataPermissions functions
      try {
        perms = await app.mutableData.newPermissions()
      } catch(err) {
        return err;
      }
      return `Returns permissions interface: ${perms}`;
    },

    newMutation: async () => {
      // This function and it's return value correspond to safeMutableDataMutation functions
      try {
        mutation = await app.mutableData.newMutation()
      } catch(err) {
        return err;
      }
      return `Returns MutableData mutation interface: ${mutation}`;
    },

    newEntries: async () => {
      try {
        entries = await app.mutableData.newEntries()
      } catch(err) {
        return err;
      }
      return `Returns MutableData entries interface: ${entries}`;
    },

    quickSetup: async () => {
      // Why are the name and description attributes important?
      // When the authenticator requests your approval to access a MutableData/
      // the name and description will be used to help identify it.
      const name = 'Mutable data name';
      const description = 'Mutable data description';
      try {
        mData = await mData.quickSetup({key1: 'value1'}, name, description);
      } catch (err) {
        return err;
      }
      return `Returns MutableData interface: ${mData}`;
    },

    setMetadata: async () => {
      // Why are the name and description attributes important?
      // When the authenticator requests your approval to access a MutableData/
      // the name and description will be used to help identify it.
      const name = 'Mutable data name';
      const description = 'Mutable data description';
      try {
        mData = await mData.setMetadata(name, description);
      } catch (err) {
        return err;
      }
      return `Returns mData: ${mData}`;
    },

    encryptKey: async () => {
    try {
      encryptedKey = await mData.encryptKey('key1')
    } catch(err) {
      return err;
    }
     return `Encrypted key: ${encryptedKey}`;
    },

    encryptValue: async () => {
      try {
        encryptedValue = await mData.encryptValue('value1')
      } catch(err) {
        return err;
      }
       return `Encrypted value: ${encryptedValue}`;
    },

    decrypt: async () => {
      // `value` argument can be either encryptedValue or encryptedKey
      try {
        decryptedValue = await mData.decrypt(value)
      } catch(err) {
        return err;
      }
      return `Decrypted key: ${decryptedValue}`;
    },

    getNameAndTag: async () => {
      try {
        var nameAndTag = await mData.getNameAndTag()
	mdName = nameAndTag.name.buffer;
      } catch(err) {
        return err;      
      }
      return `Name: ${nameAndTag.name.buffer}, Tag: ${nameAndTag.type_tag}`;
    },

    getVersion: async () => {
    try {
      version = await mData.getVersion()
    } catch(err) {
      return err; 
    }
    return `MutableData current version: ${version}`;
    },

    get: async () => {
     // get entry valuefrom mutable data by key
      try {
        var value = await mData.get('key1')
      } catch(err) {
        return err;
      }
      return `Value: ${value.buf}, Version: ${value.version}`;
    },

    put: async () => {
      await mData.put(perms, entries)
      return 'Finished creating and committing MutableData to the network';
    },

    getEntries: async () => {
      // This function returns a handle that will allow you to use the safeMutableDataEntries module below.
      try {
        entries = await mData.getEntries()
      } catch(err) {
        return err;
      }
      return `Returns handle for safeMutableDataEntries operations: ${entries}`;
    },

    getKeys: async () => {
      try {
        var keysArray = await mData.getKeys();
      } catch (err) {
        return err;
      }
      return `Returns array of entry keys: ${keysArray}`;
    },

    getValues: async () => {
      try {
        const valuesArray = await mData.getValues();
	var readableString = valuesArray.map(valueObject => valueObject.buf);
      } catch(err) {
        return err; 
      }
      return `Returns array of entry values: ${readableString}`;
    },

    getPermissions: async () => {
      try {
        perms = await mData.getPermissions()
      } catch(err) {
        return err;
      }
      return `Returns handle to operate on safeMutableDataPermissions: ${perms}`;
    },

    getUserPermissions: async () => {
      // First use app.crypto.getAppPubSignKey to obtain signKeyHandle
      try {
        perms = await mData.getUserPermissions(pubSignKey)
      } catch(err) {
        return err;
      }
      return `Returns handle to operate on safeMutableDataPermissions: ${perms}`;
    },

    delUserPermissions: async () => {
      try {
        await mData.delUserPermissions(signKey, version + 1)
      } catch(err) {
        return err; 
      }
      return `Permissions-Set removed for the sign key provided`;
    },

    setUserPermissions: async () => {
      try {
        await mData.setUserPermissions(pubSignKey, permSet, version + 1)
      } catch(err) {
        return err;
      }
      return 'Finished setting user permission';
    },

    applyEntriesMutation: async () => {
      // Use safeMutableData.newMutation to obtain mutationHandle
      try {
       await mData.applyEntriesMutation(mutation)
      } catch(err) {
        return err;
      }
      return 'New entry was inserted in the MutableData and committed to the network';
    },

    serialise: async () => {
    try {
      serialisedMD = await mData.serialise()
    } catch(err) {
      return err;
    }
    return `MutableData serialised version output: ${serialisedMD}`;
    },

    fromSerial: async () => {
      try {
        mData = await app.mutableData.fromSerial(serializedMD)
      } catch(err) {
        return err;
      }
       return `Returns interface to MutableData: ${mData}`;
    },

    emulateAs: async () => {
      // Wrap this MutableData into a known abstraction. Currently known: NFS
      // The returned nfsHandle will allow you to use safeNfs functions
      try {
        nfs = await mData.emulateAs('NFS')
      } catch(err) {
        return err;
      }
      return `Returns nfsHandle: ${nfs}`;
    }
  }
}
