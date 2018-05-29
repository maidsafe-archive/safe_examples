module.exports = {
  mutableDataPermissions: {
    len: async () => {
      let length = null;
      try {
        length = await perms.len(permsHandle)
      } catch(err) {
        return err;
      }
      return `Number of permissions entries in the MutableData: ${length}`;
    },

    getPermissionsSet: async () => {
      try {
        permSet = await perms.getPermissionsSet(pubSignKey)
      } catch(err) {
        return err;
      }
      	return `Returns permissions-set for specific signing key: ${permSet}`;
    },

    insertPermissionsSet: async () => {
      // Example:
      // const permissionSet = ['Insert', 'ManagePermissions'];
      // app.crypto.getAppPubSignKey(appHandle)
      //    .then((pk) => pubSignKey = pk)
      //    .then(_ => mData.getPermissions())
      //    .then((p) => perms = p)
      //    .then(_ => perms.insertPermissionsSet(pubSignKey, permissionSet))
      //    .then(_ => console.log('Finished inserting new permissions'));
      
      const pmSet = ['Insert', 'ManagePermissions'];
      try {
        await perms.insertPermissionsSet(pubSignKey, pmSet)
      } catch(err) {
        return err;
      }
      	return 'Finished inserting new permissions';
    },

    listPermissionSets: async () => {
      try {
        var permsArray = await perms.listPermissionSets();
      } catch(err) {
        return err;
      }
      return `Returns array of permission-sets: ${JSON.stringify(permsArray)}`;
    }
  }
}
