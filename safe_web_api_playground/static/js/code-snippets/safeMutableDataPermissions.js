module.exports = {
  safeMutableDataPermissions: {
    len: () => {
      // Need a permsHandle?
      // Use safeMutableData.getPermissions to obtain it.

      return window.safeMutableDataPermissions.len(permsHandle)
      .then((len) => {
      	return 'Number of permissions entries in the MutableData: ' + len;
      });
    },

    getPermissionsSet: () => {
      // Use safeMutableData.getPermissions to obtain
      // Use safeCrypto.getAppPubSignKey to get signKeyHandle

      return window.safeMutableDataPermissions.getPermissionsSet(permsHandle, signKeyHandle)
      .then(res => {
      	permSetHandle = res;
      	return 'Returns permissions-set handle for specific signing key: ' + res;
      });
    },

    insertPermissionsSet: () => {
      // Example:
      // const permissionSet = ['Insert', 'ManagePermissions'];
      // window.safeCrypto.getAppPubSignKey(appHandle)
      //    .then((pk) => signKeyHandle = pk)
      //    .then(_ => window.safeMutableData.getPermissions(mdHandle))
      //    .then((h) => permsHandle = h)
      //    .then(_ => window.safeMutableDataPermissions.insertPermissionsSet(permsHandle, signKeyHandle, permissionSet))
      //    .then(_ => console.log('Finished inserting new permissions'));
      
      const pmSet = ['Insert', 'ManagePermissions'];
      return window.safeMutableDataPermissions.insertPermissionsSet(permsHandle, signKeyHandle, pmSet)
      .then(_ => {
      	return 'Finished inserting new permissions' + _;
      });
    },

    listPermissionSets: async () => {
      const permsArray = window.safeMutableDataPermissions.listPermissionSets(permsHandle);
      return `Returns array of permission-sets: ${permsArray}`;
    },

    free: () => {
      window.safeMutableDataPermissions.free(permsHandle);
      permsHandle = null;
      return;
    },

  }
}
