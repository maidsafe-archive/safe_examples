module.exports = {
  safeMutableDataPermissionsSet: {
    setAllow: () => {
      // window.safeCrypto.getAppPubSignKey(appToken)
      //.then((pk) => signKeyHandle = pk)
      //.then(_ => window.safeMutableData.newPermissionSet(appToken))
      //.then((h) => permSetHandle = h)
      //.then(_ => window.safeMutableDataPermissionsSet.setAllow(permSetHandle, 'Delete'))
      //    .then(_ => window.safeMutableData.getVersion(mdHandle))
      //.then((version) => window.safeMutableData.setUserPermissions(mdHandle, signKeyHandle, permSetHandle, version + 1))
      //.then(_ => console.log('Finished setting user permission'));

      let action = "Insert";
      return window.safeMutableDataPermissionsSet.setAllow(permSetHandle, action)
      .then(_ => {
        if(Object.getPrototypeOf(_) == Array.prototype) {
          return action + ' permission is configured on permission-set object';
        }
      	return _;
      })
    },

    setDeny: () => {
      // window.safeCrypto.getAppPubSignKey(appToken)
      // .then((pk) => signKeyHandle = pk)
      // .then(_ => window.safeMutableData.newPermissionSet(appToken))
      // .then((h) => permSetHandle = h)
      // .then(_ => window.safeMutableDataPermissionsSet.setDeny(permSetHandle, 'Update'))
      // .then(_ => window.safeMutableData.getVersion(mdHandle))
      // .then((version) => window.safeMutableData.setUserPermissions(mdHandle, signKeyHandle, permSetHandle, version + 1))
      // .then(_ => console.log('Finished setting user permission'));

      let action = "Insert";
      return window.safeMutableDataPermissionsSet.setDeny(permSetHandle, action)
      .then(_ => {
        if(Object.getPrototypeOf(_) == Array.prototype) {
          return action + ' permission is removed from permission-set object';
        }
      	return _;
      })
    },

    clear: () => {
      // window.safeCrypto.getAppPubSignKey(appToken)
      // .then((pk) => signKeyHandle = pk)
      // .then(_ => window.safeMutableData.newPermissionSet(appToken))
      // .then((h) => permSetHandle = h)
      // .then(_ => window.safeMutableDataPermissionsSet.clear(permSetHandle, 'Insert'))
      // .then(_ => window.safeMutableData.getVersion(mdHandle))
      // .then((version) => window.safeMutableData.setUserPermissions(mdHandle, signKeyHandle, permSetHandle, version + 1))
      // .then(_ => console.log('Finished setting user permission'));

      let action = 'Insert';
      return window.safeMutableDataPermissionsSet.clear(permSetHandle, action)
      .then(_ => {
        if(Object.getPrototypeOf(_) == Array.prototype) {
          return 'Removes all '+ action +' permissions from the set';
        }
      	return _;

      	// Be sure to commit this change to the network with safeMutableData.setUserPermissions
      });
    },

    free: () => {
      return window.safeMutableDataPermissionsSet.free(permSetHandle)
      .then(_ => {
        permSetHandle = null;
      	return 'permissionsSetHandle is freed from memory';
      });
    },

  }
}
