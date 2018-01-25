module.exports = {
  safeMutableDataPermissions: {
    len: async () => {
      // Need a permsHandle?
      // Use safeMutableData.getPermissions to obtain it.
      let length = null;
      try {
        length = await window.safeMutableDataPermissions.len(permsHandle)
      } catch(err) {
        return err;
      }
      return `Number of permissions entries in the MutableData: ${length}`;
    },

    getPermissionsSet: async () => {
      // Use safeMutableData.getPermissions to obtain
      // Use safeCrypto.getAppPubSignKey to get pubSignKeyHandle
      try {
        permSet = await window.safeMutableDataPermissions.getPermissionsSet(permsHandle, pubSignKeyHandle)
      } catch(err) {
        return err;
      }
      	return `Returns permissions-set for specific signing key: ${permSet}`;
    },

    insertPermissionsSet: async () => {
      // Example:
      // const permissionSet = ['Insert', 'ManagePermissions'];
      // window.safeCrypto.getAppPubSignKey(appHandle)
      //    .then((pk) => pubSignKeyHandle = pk)
      //    .then(_ => window.safeMutableData.getPermissions(mdHandle))
      //    .then((h) => permsHandle = h)
      //    .then(_ => window.safeMutableDataPermissions.insertPermissionsSet(permsHandle, pubSignKeyHandle, permissionSet))
      //    .then(_ => console.log('Finished inserting new permissions'));
      
      const pmSet = ['Insert', 'ManagePermissions'];
      try {
        await window.safeMutableDataPermissions.insertPermissionsSet(permsHandle, pubSignKeyHandle, pmSet)
      } catch(err) {
        return err;
      }
      	return 'Finished inserting new permissions';
    },

    listPermissionSets: async () => {
      try {
        var permsArray = await window.safeMutableDataPermissions.listPermissionSets(permsHandle);
      } catch(err) {
        return err;
      }
      return `Returns array of permission-sets: ${JSON.stringify(permsArray)}`;
    },

    free: () => {
      window.safeMutableDataPermissions.free(permsHandle);
      permsHandle = null;
      return;
    },

  }
}
