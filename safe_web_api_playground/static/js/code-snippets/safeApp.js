module.exports = {
  safeApp: {

    initialise: async () => {

      // Welcome! Get started by running this snippet.
      // Then open the `safeApp` module on the left-hand side of the screen.
      // Reference documentation: http://docs.maidsafe.net/beaker-plugin-safe-app/
      // When not focused in this text box, simply use your `Enter` key at any time to run code snippets.

      const appInfo = {
        id: 'net.maidsafe.api_playground.webclient.10',
        name: 'SAFE web API playground',
        vendor: 'MaidSafe Ltd.',
        scope: null
      };

      try {
        appHandle = await window.safeApp.initialise(appInfo);
      } catch (err) {
        return err;
      }
      return `Returns appHandle ${appHandle}`;
    },

    authorise: async () => {
      // After clicking `RUN`, check SAFE browser authenticator for authorization request

      try {
        authUri = await window.safeApp.authorise(
          appHandle,
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
          },
          {own_container: true}
        );
      } catch (err) {
        return err;
      }
      return `App was authorised and auth URI received: ${authUri}`;
    },

    connect: async () => {
      try {
        appHandle = await window.safeApp.connect(appHandle);
      } catch (err) {
        return err;
      }
      return `Unregistered session created. App token returned: ${appHandle}`;
    },

    connectAuthorised: async () => {
      try {
        appHandle = await window.safeApp.connectAuthorised(appHandle, authUri);
      } catch (err) {
        return err;
      }
      return `The app was authorised and a session was created with the network. App token returned: ${appHandle}`;
    },

    authoriseContainer: async () => {
      // After clicking `RUN`, check SAFE browser authenticator for authorization request
      try {
        authUri = await window.safeApp.authoriseContainer(
          appHandle,
          { _publicNames: ['Update'] } // request to update into `_publicNames` container
        )
      } catch (err) {
        return err;
      }
      return `App was authorised. Auth URI returned: ${authUri}`;
    },

    authoriseShareMd: async () => {
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
          type_tag: 15001,
          name: mdName,
          perms: ['Insert']
        }
      ];
      try {
        authUri = await window.safeApp.authoriseShareMd(appHandle, permissions);
      } catch (err) {
        return err;
      }
      return `App was authorised with permissions for specified Mutable Data structures. Returns auth uri: ${authUri}`;
    },

    webFetch: async () => {
      try {
        var data = await window.safeApp.webFetch(
          appHandle,
          'safe://safeapi.playground/index.html' // the SAFE Network URL
        );
      } catch(err) {
        return err;
      }
      return String.fromCharCode.apply(null, new Uint8Array(data));
    },

    networkState: async () => {
      try {
        var networkState = await window.safeApp.networkState(appHandle);
      } catch (err) {
        return err;
      }
      return `Current network state: ${networkState}`;
    },

    isNetStateInit: async () => {
    try {
      var bool = await window.safeApp.isNetStateInit(appHandle);
    } catch (err) {
      return err;
    }
      return `Is app in initialised network state? ${bool}`;
    },

    isNetStateConnected: async () => {
      try {
        var bool = await window.safeApp.isNetStateConnected(appHandle);
      } catch (err) {
        return err;
      }
      return `Is app in connected network state? ${bool}`;
    },

    isNetStateDisconnected: async () => {
      try {
        var bool = await window.safeApp.isNetStateDisconnected(appHandle);
      } catch (err) {
        return err;
      }
      return `Is app in disconnected network state? ${bool}`;
    },

    isRegistered: async () => {
    try {
      var bool = await window.safeApp.isRegistered(appHandle); 
    } catch (err) {
      return err;
    }
      return `Is app registered? ${bool}`;
    },

    clearObjectCache: async () => {
      try {
        await window.safeApp.clearObjectCache(appHandle);
      } catch(err) {
        return err;
      } 
      return 'All handles, except for appHandle, have been freed from memory';
    },

    isMockBuild: async () => {
      try {
        var bool = await window.safeApp.isMockBuild(appHandle);
      } catch (err) {
        return err;
      }
      return `Are the underlying native libraries compiled for mock routing? ${bool}`;
    },

    canAccessContainer: async () => {
      const container = '_public';
      const permissions = ['Read'];
      try {
        var bool = await window.safeApp.canAccessContainer(appHandle, container, permissions);
      } catch (err) {
        return err;
      }
      return `Has the app ${permissions} permission for ${container} container ? ${bool}`;
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
      // const appHandle = await window.safeApp.initialise(appInfo);
      // const authUri = await window.safeApp.authorise(appHandle, permissions, {});
      // await window.safeApp.connectAuthorised(appHandle, authUri);

      // await window.safeApp.refreshContainersPermissions(appHandle);

      // const containerHandle = await window.safeApp.getContainer(appHandle, '_public');
      // let permsObject = await window.safeApp.getContainersPermissions(appHandle);
      // console.log(permsObject);

      // const updatePermissions = {
      //   _publicNames: ['Read', 'Insert', 'Update', 'Delete', 'ManagePermissions']
      // }

      // await window.safeApp.authoriseContainer(appHandle, updatePermissions);
      // console.log(permsObject);
      // await window.safeApp.refreshContainersPermissions(appHandle);

      // permsObject = await window.safeApp.getContainersPermissions(appHandle);
      // console.log(permsObject);
      try {
        await window.safeApp.refreshContainersPermissions(appHandle);
      } catch (err) {
        return err;
      }
      return `Container permissions refreshed on client.`;
    },

    getContainersPermissions: async () => {
      try {
        var permissionsData = await  window.safeApp.getContainersPermissions(appHandle);
      } catch(err) {
        return err;
      }
      return `Returns object with container names and permissions: ${JSON.stringify(permissionsData)}`;
    },

    getOwnContainer: async () => {
      try {
        mdHandle = await window.safeApp.getOwnContainer(appHandle);
      } catch (err) {
        return err;
      }
      return `Returns handle for Mutable Data structure behind app's root container: ${mdHandle}`
    },

    getContainer: async () => {
      const container = '_public';
      mdHandle = await window.safeApp.getContainer(appHandle, container);
      return `Returns handle to Mutable Data behind ${container} container: ${mdHandle}` 
    },

    reconnect: async () => {
      try {
        await window.safeApp.reconnect(appHandle);
      } catch (err) {
        return err;
      }
      return 'App reconnected to network';
    },

    logPath: async () => {
      const filename = null; // if null, find path of safe_core log file
      try {
        var path = await window.safeApp.logPath(appHandle, filename);
      } catch(err) {
        return err;
      }
      return `Path of log file: ${path}`;
    },

    free: () => {
      // Free the SAFE app instance from memory
      window.safeApp.free(appHandle);
      appHandle = null;
      authUri = null;
      return;
    },

  }
}
