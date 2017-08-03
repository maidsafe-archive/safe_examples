module.exports = {
  safeApp: {

    initialise: () => {

      // Welcome! Get started by running this snippet.
      // Then open the `safeApp` module on the left-hand side of the screen.
      // Reference documentation: http://docs.maidsafe.net/beaker-plugin-safe-app/
      // When not focused in this text box, simply use your `Enter` key at any time to run code snippets.

      let appInfo = {
        id: 'net.maidsafe.api_playground.webclient.10',
        name: 'SAFE web API playground',
        vendor: 'MaidSafe Ltd.',
        scope: null
      };

      return window.safeApp.initialise(appInfo)
      .then(function(res) {
        appHandle = res;
        return 'Returns app token: ' + res;
      });

    },

    authorise: () => {
      // After clicking `RUN`, check SAFE browser authenticator for authorization request

      return window.safeApp.authorise(
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
      ).then((res) => {
        authUri = res;
        return 'App was authorised and auth URI received: ' + res;
      });
    },

    connectAuthorised: () => {
      return window.safeApp.connectAuthorised(appHandle, authUri)
      .then(appHandle => {
        return 'The app was authorised and a session was created with the network. App token returned: ' + appHandle;
      });
    },

    authoriseContainer: () => {
      // After clicking `RUN`, check SAFE browser authenticator for authorization request

      return window.safeApp.authoriseContainer(
        appHandle,
        { _publicNames: ['Update'] } // request to update into `_publicNames` container
        ).then((res) => {
          authUri = res;
          return 'App was authorised. Auth URI returned: ' + res;
        });
    },

    connect: () => {
      return window.safeApp.connect(appHandle)
      .then(appHandle => {
        return 'Unregistered session created. App token returned: ' + appHandle;
      });
    },

    webFetch: () => {
      return window.safeApp.webFetch(
        appHandle,
        'safe://safeapi.playground/index.html' // the SAFE Network URL
      )
      .then((data) => {
        return String.fromCharCode.apply(null, new Uint8Array(data));
      });
    },

    isRegistered: () => {
      return window.safeApp.isRegistered(appHandle)
      .then((r) => {
        return 'Is app registered?: ' + r;
      });
    },

    networkState: () => {
      return window.safeApp.networkState(appHandle)
      .then((s) => {
        return 'Current network state: ' + s;
      });
    },

    canAccessContainer: () => {
      let container = '_public';
      let permissions = ['Read']
      return window.safeApp.canAccessContainer(appHandle, '_public', permissions)
        .then((r) => {
        return 'Has the app ' + permissions + ' permission for container ' + container + '?: ' + r;
      });
    },

    refreshContainersPermissions: () => {
      return window.safeApp.refreshContainersPermissions(appHandle)
      .then(res => {
        return res;
      });
    },

    getContainersNames: () => {
      return window.safeApp.getContainersNames(appHandle)
      .then(res => {
        return 'Returns array of container names: ' + res;
      });
    },

    getHomeContainer: () => {
      return window.safeApp.getHomeContainer(appHandle)
      .then((res) => {
        mdHandle = res;
        return 'Returns handle for Mutable Data structure behind home container created by authenticator: ' + res;
      });
    },

    getContainer: () => {
      let container = '_public';
      return window.safeApp.getContainer(appHandle, container)
      .then((res) => {
        mdHandle = res;
        return 'Returns handle to Mutable Data behind ' + container + ' container: ' + res;
      });
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
