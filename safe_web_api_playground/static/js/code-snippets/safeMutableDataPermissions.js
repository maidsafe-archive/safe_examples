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
      // window.safeCrypto.getAppPubSignKey(appHandle)
      //    .then((pk) => signKeyHandle = pk)
      //    .then(_ => window.safeMutableData.getPermissions(mdHandle))
      //    .then((h) => permsHandle = h)
      //    .then(_ => window.safeMutableData.newPermissionSet(appHandle))
      //    .then((h) => permSetHandle = h)
      //    .then(_ => window.safeMutableDataPermissionsSet.setAllow(permSetHandle, 'Insert'))
      //    .then(_ => window.safeMutableDataPermissionsSet.setAllow(permSetHandle, 'ManagePermissions'))
      //    .then(_ => window.safeMutableDataPermissions.insertPermissionsSet(permsHandle, signKeyHandle, permSetHandle))
      //    .then(_ => console.log('Finished inserting new permissions'));

      return window.safeMutableDataPermissions.insertPermissionsSet(permsHandle, signKeyHandle, permSetHandle)
      .then(_ => {
      	return 'Finished inserting new permissions';
      });
    },

    forEach: () => {
      return window.safeMutableDataPermissions.forEach(permsHandle, (p) => {

        // Please note that values logged here will show up in your SAFE browser console.
        // Check there for the following logged values.
        console.log(p);
      	console.log('Permissions-set entry handle: ', String.fromCharCode.apply(null, new Uint8Array(p)));

      }).then(_ => 'Iteration finished');
    },

    free: () => {
      window.safeMutableDataPermissions.free(permsHandle);
      permsHandle = null;
      return;
    },

  }
}
