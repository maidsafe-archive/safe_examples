module.exports = {
  webid: {
    init: async () => {
      // Experimental feature
      try {
          await webid.init();
      } catch(err) {
          return err;
      }
      return `Resolves upon initialising WebID.`;
    },

    fetchContent: async () => {
      // Experimental feature
      try {
          await webid.fetchContent();
      } catch(err) {
          return err;
      }
      return `Resolves upon fetching WebID content.`;
    },

    create: async () => {
      // Experimental feature
      const profile = {
          nick: "safedev",
          name: "SAFENetwork Developer",
          uri: "safe://id.safedev"
      };
      try {
          await webid.create(profile, profile.nick);
      } catch(err) {
          return err;
      }
      return `Resolves upon creating WebID.`;
    },

    update: async () => {
      // Experimental feature
      const profile = {
          nick: "safedev",
          name: "SAFENetwork Develoer-Update",
          uri: "safe://id.safedev"
      };
      try {
          await webid.update(profile);
      } catch(err) {
          return err;
      }
      return `Resolves upon updating WebID.`;
    },

    serialise: async () => {
      // Experimental feature
      const mimeType = "text/turtle";
      try {
          var serialised = await webid.serialise(mimeType);
      } catch(err) {
          return err;
      }
      return `Returns serialised WebID.: ${serialised}`;
    },

  }
}
