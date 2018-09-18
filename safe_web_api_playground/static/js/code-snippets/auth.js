module.exports = {
  auth: {
    genAuthUri: async () => {
      const containerPermissions = 
      {
        _public: [
          'Read',
          'Insert',
          'Update',
          'Delete'
        ],
        _publicNames: [
          'Read',
          'Insert',
          'Update',
          'Delete'
        ]
      };
      const authorisationOptions = {own_container: true};

      try {
        authReqUri = await app.auth.genAuthUri(
          containerPermissions,
          authorisationOptions
        );
      } catch (err) {
        return err;
      }
      return `Auth request URI object returned. In safeApp section, pass returned value to safe.authorise.`;
    },

    genConnUri: async () => {
      try {
        connReqUri = await app.auth.genConnUri();
      } catch (err) {
        return err;
      }
      return `Connection request URI: ${connReqUri}`;
    },

    loginFromUri: async () => {
      try {
        app = await app.auth.loginFromUri(authUri);
      } catch (err) {
        return err;
      }
      return `App connected to network with authenticated or unregistered session, depending on authUri provided. App interface returned.`;
    },

    genContainerAuthUri: async () => {
      const containerPermissions = 
        { _videos: [
            'Read',
            'Insert',
            'Update',
          ]
        }; // request permissions for `_videos` container
      try {
        contReqUri = await app.auth.genContainerAuthUri(containerPermissions);
      } catch (err) {
        return err;
      }
      return `Container request URI generated: ${contReqUri}`;
    },

    genShareMDataUri: async () => {
      /*  [
      *    { type_tag: 15001,   // request for MD with tag 15001
      *      name: 'XoRname1',  // request for MD located at address 'XoRname1'
      *      perms: ['Insert'], // request for inserting into the referenced MD
      *    },
      *    { type_tag: 15020,   // request for MD with tag 15020
      *      name: 'XoRname2',  // request for MD located at address 'XoRname2'
      *      perms: ['Insert', `Update`], // request for updating and inserting into the referenced MD
      *    }
      *  ]
      */

      const permissions = [
        {
          typeTag: 15001,
          name: mdName,
          perms: ['Insert']
        }
      ];
      try {
        shareMDataReqUri = await app.auth.genShareMDataUri(permissions);
      } catch (err) {
        return err;
      }
      return `Share MData request URI generated: ${shareMDataReqUri}`;
    },

    registered: async () => {
      const bool = app.auth.registered; 
      return `Is app registered? ${bool}`;
    },

    canAccessContainer: async () => {
      const container = '_public';
      const permissions = ['Read'];
      try {
        var bool = await app.auth.canAccessContainer(container, permissions);
      } catch (err) {
        return err;
      }
      return `Has the app ${permissions} permission for ${container} container? ${bool}`;
    },

    refreshContainersPermissions: async () => {
      // const permissions = {
      //   _public: ['Read', 'Insert', 'Update', 'Delete', 'ManagePermissions']
      // };

      // const appInfo = {
      //   id: `random net.maidsafe.beaker_plugin_safe_app.test${Math.round(Math.random() * 100000)}`,
      //   name: `random beaker_plugin_safe_app_test${Math.round(Math.random() * 100000)}`,
      //   vendor: 'MaidSafe Ltd.'
      // };
      // let app = await safe.initialiseApp(appInfo);
      // const authReqUri = await app.auth.genAuthUri(permissions, {});
      // let authUri = await safe.authorise(authReqUri);
      // app = await app.auth.loginFromUri(authUri);

      // await app.auth.refreshContainersPermissions();

      // const mData = await app.auth.getContainer('_public');
      // let permsObject = await app.auth.getContainersPermissions();
      // console.log(permsObject);

      // const updatePermissions = {
      //   _publicNames: ['Read', 'Insert', 'Update', 'Delete', 'ManagePermissions']
      // }

      // let contReqUri = await app.auth.genContainerAuthUri(updatePermissions);
      // authUri = await safe.authorise(contReqUri);
      // console.log(permsObject);
      // await app.auth.refreshContainersPermissions();

      // permsObject = await app.auth.getContainersPermissions();
      // console.log(permsObject);
      try {
        await app.auth.refreshContainersPermissions();
      } catch (err) {
        return err;
      }
      return `Container permissions refreshed on client.`;
    },

    getContainersPermissions: async () => {
      try {
        var permissionsData = await app.auth.getContainersPermissions();
      } catch(err) {
        return err;
      }
      return `Returns object with container names and permissions: ${JSON.stringify(permissionsData)}`;
    },

    readGrantedPermissions: async () => {
      // This function appears redundant to app.auth.getContainersPermissions, however the difference\
      // is that readGrantedPermissions doesn't need an authorised app connection. 
      try {
        var grantedPermissions = await app.auth.readGrantedPermissions(authUri);
      } catch(err) {
        return err;
      }
      return `Returns object with granted container permissions: ${JSON.stringify(grantedPermissions)}`;
    },

    getOwnContainer: async () => {
      try {
        mData = await app.auth.getOwnContainer(appHandle);
      } catch (err) {
        return err;
      }
      return `Returns interface for Mutable Data structure behind app's root container: ${mData}`
    },

    getOwnContainerName: async () => {
      try {
        var containerName = await app.auth.getOwnContainerName();
      } catch(err) {
        return err;
      }
      return `Returns name of app's root container: ${containerName}`;
    },

    getContainer: async () => {
      const container = '_public';
      mData = await app.auth.getContainer(container);
      return `Returns handle to Mutable Data behind ${container} container: ${mdHandle}` 
    },

  }
}
