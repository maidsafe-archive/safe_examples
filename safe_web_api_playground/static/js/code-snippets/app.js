module.exports = {
  app: {
    initialiseApp: async () => {
      // Welcome! Get started by running this snippet.
      // Reference documentation: http://docs.maidsafe.net/safe_app_nodejs/

      /* Helpful tips */
      // When not focused in this editor, simply hit `Enter` at any time to run code.

      const appInfo = {
        id: 'net.maidsafe.api_playground.webclient.10',
        name: 'SAFE web API playground',
        vendor: 'MaidSafe Ltd.',
        scope: null
      };

      const networkStateCallback = (state) => {
        console.log('Network state change event: ', state); 
      };

      // http://docs.maidsafe.net/safe_app_nodejs/#initoptions
      const initialisationOptions = {
        log: true,
        registerScheme: false
      }; 

      try {
        app = await safe.initialiseApp(appInfo, networkStateCallback, initialisationOptions);
      } catch (err) {
        return err;
      }
      return `Returns app interface. Next, open the auth section to the left and click on genAuthUri.`;
    },

    fromAuthUri: async () => {
      // Connects to network with existing authUri
      try {
        app = await safe.fromAuthUri(appInfo, authUri, networkStateCallback, initialisationOptions);
      } catch (err) {
        return err;
      }
      return `Returns app interface.`;
    },

    authorise: async () => {
      // Sends autorisation request to authenticator
      try {
        authUri = await safe.authorise(authReqUri);
      } catch (err) {
        return err;
      }
      return `Auth URI returned. Next, back in auth section, pass authUri to loginFromUri.`;
    },

    webFetch: async () => {
      const webFetchOptions = { range: { start:0, end: undefined } };
      try {
        var data = await app.webFetch(
          'safe://api.playground',
	  webFetchOptions
        );
      } catch(err) {
        return err;
      }
      return data.body;
    },

    networkState: async () => {
      const networkState = app.networkState;
      return `Current network state: ${networkState}`;
    },

    isNetStateInit: async () => {
      const bool = app.isNetStateInit();
      return `Is app in initialised network state? ${bool}`;
    },

    isNetStateConnected: async () => {
      const bool = app.isNetStateConnected();
      return `Is app in connected network state? ${bool}`;
    },

    isNetStateDisconnected: async () => {
      const bool = app.isNetStateDisconnected();
      return `Is app in disconnected network state? ${bool}`;
    },

    clearObjectCache: async () => {
      try {
        await app.clearObjectCache();
      } catch(err) {
        return err;
      } 
      return 'All handles, except for app, have been freed from memory';
    },

    isMockBuild: async () => {
      const bool = app.isMockBuild();
      return `Are the underlying native libraries compiled for mock routing? ${bool}`;
    },

    reconnect: async () => {
      try {
        await app.reconnect();
      } catch (err) {
        return err;
      }
      return 'App reconnected to network';
    },

    logPath: async () => {
      const filename = null; // if null, find path of safe_core log file
      try {
        var path = await app.logPath(filename);
      } catch(err) {
        return err;
      }
      return `Path of log file: ${path}`;
    },

    getAccountInfo: async () => {
      try {
        var accountInfo = await app.getAccountInfo();
      } catch(err) {
        return err;
      }
      return `Account info: ${JSON.stringify(accountInfo)}`;
    }
  }
}
