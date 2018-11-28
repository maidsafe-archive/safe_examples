module.exports = {
  app: {
    initialiseApp: async () => {
      // Welcome! Get started by running this snippet.
      
      /* Helpful tip */
      // When not focused in this editor, simply hit `Enter` at any time to run code.
      
      const appInfo = {
        id: 'net.maidsafe.api_playground.webclient.9',
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

    getOwnContainerName: async () => {
      try {
        var containerName = await app.getOwnContainerName();
      } catch(err) {
        return err;
      }
      return `Returns name of app's root container: ${containerName}`;
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

    fetch: async () => {
      // Experimental feature
      // If you have an XOR-URL with a type tag, and therefore represents MutableData,
      // use this operation to fetch an interface to the underlying data structure.
      try {
        var data = await app.fetch(
          'safe://hyfktcerbwpctjz6ws8468hncw1ddpzrz65z3mapzx9wr413r7gj3w6yt5y:15001',
        );
      } catch(err) {
        return err;
      }
      console.log(data);
      return data;
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

    appIsMock: async () => {
      const bool = app.appIsMock();
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
