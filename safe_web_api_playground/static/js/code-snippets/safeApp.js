module.exports = {
  safeApp: {

    initialise: () => {

      // Welcome! Get started by running this snippet.
      // Then open the `safeApp` module on the left-hand side of the screen.
      // Reference documentation: http://docs.maidsafe.net/beaker-plugin-safe-app/
      // When not focused in this text box, simply use your `Enter` key at any time to run code snippets.

      let appInfo = {
        id: 'net.maidsafe.api_playground.webclient.10',
        name: 'SAFE browser API playground',
        vendor: 'MaidSafe Ltd.'
      };

      return window.safeApp.initialise(appInfo)
      .then(function(res) {
        appToken = res;
        return 'Returns app token: ' + res;
      });

    },

    authorise: () => {
      // After clicking `RUN`, check SAFE browser authenticator for authorization request

      return window.safeApp.authorise(
        appToken,
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
      return window.safeApp.connectAuthorised(appToken, authUri)
      .then(appToken => {
        return 'The app was authorised and a session was created with the network. App token returned: ' + appToken;
      });
    },

    authoriseContainer: () => {
      // After clicking `RUN`, check SAFE browser authenticator for authorization request

      return window.safeApp.authoriseContainer(
        appToken,
        { _publicNames: ['Update'] } // request to update into `_publicNames` container
        ).then((res) => {
          authUri = res;
          return 'App was authorised. Auth URI returned: ' + res;
        });
    },

    connect: () => {
      return window.safeApp.connect(appToken)
      .then(appToken => {
        return 'Unregistered session created. App token returned: ' + appToken;
      });
    },

    webFetch: () => {
      return window.safeApp.webFetch(
        appToken,
        'safe://safeapi.playground/index.html' // the SAFE Network URL
      )
      .then((data) => {
        return String.fromCharCode.apply(null, new Uint8Array(data));
      });
    },

    isRegistered: () => {
      return window.safeApp.isRegistered(appToken)
      .then((r) => {
        return 'Is app registered?: ' + r;
      });
    },

    networkState: () => {
      return window.safeApp.networkState(appToken)
      .then((s) => {
        return 'Current network state: ' + s;
      });
    },

    canAccessContainer: () => {
      let container = '_public';
      let permissions = ['Read']
      return window.safeApp.canAccessContainer(appToken, '_public', permissions)
        .then((r) => {
        return 'Has the app ' + permissions + ' permission for container ' + container + '?: ' + r;
      });
    },

    refreshContainersPermissions: () => {
      return window.safeApp.refreshContainersPermissions(appToken)
      .then(res => {
        return res;
      });
    },

    getContainersNames: () => {
      return window.safeApp.getContainersNames(appToken)
      .then(res => {
        return 'Returns array of container names: ' + res;
      });
    },

    getHomeContainer: () => {
      return window.safeApp.getHomeContainer(appToken)
      .then((res) => {
        mdHandle = res;
        return 'Returns handle for Mutable Data structure behind home container created by authenticator: ' + res;
      });
    },

    getContainer: () => {
      let container = '_public';
      return window.safeApp.getContainer(appToken, container)
      .then((res) => {
        mdHandle = res;
        return 'Returns handle to Mutable Data behind ' + container + ' container: ' + res;
      });
    },

    free: () => {
      // Free the SAFE app instance from memory
      return window.safeApp.free(appToken).
      then(_ => {
        appToken = null;
        authUri = null;
        return 'appToken freed from memory';
      })
    },

  }
}
