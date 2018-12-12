module.exports = {
  web: {
    getVocabs: async () => {
        // Experimental feature
        vocabs = app.web.getVocabs(rdf);
        return;
    },

    addPublicNameToDirectory: async () => {
      // Experimental feature
      try {
          const networkResource = await app.fetch('safe://hyfktce85xaif4kdamgnd16uho3w5z7peeb5zeho836uoi48tgkgbc55bco:30303');
          const nameAndTag = await networkResource.content.getNameAndTag();
          const publicName = 'safedev';
          const subNamesRdfLocation = nameAndTag;
          await app.web.addPublicNameToDirectory(publicName, subNamesRdfLocation);
      } catch(err) {
          return err;
      }
      return `Resolves upon data commit to _publicNames directory.`;
    },

    linkServiceToSubname: async () => {
        // Experimental feature
        const subName = 'safedev';
        const publicName = 'safedev';
        const serviceLocation = await mData.getNameAndTag();
        const id = rdf.sym("safe://id.safedev#wallet");
        rdf.setId(id.uri);
        const DBP = rdf.namespace('http://dbpedia.org/resource/');
        rdf.add(id, rdf.vocabs.RDFS('label'), rdf.literal('wallet'));
        rdf.add(id, rdf.vocabs.RDF('Property'), DBP('SHA3-256'));
        rdf.add(id, rdf.vocabs.RDF('value'), serviceLocation.xorUrl);
        try {
            var nameAndTag = await app.web.linkServiceToSubname(subName, publicName, serviceLocation);
        } catch(err) {
            return err;
        }
        return `Name: ${nameAndTag.name}, Tag: ${nameAndTag.typeTag}, XOR-URL: ${nameAndTag.xorUrl}`;
    },

    getPublicNames: async () => {
      // Experimental feature
      try {
          var publicNamesArray = await app.web.getPublicNames();
      } catch(err) {
          return err;
      }
      return `Returns array of public names: ${JSON.stringify(publicNamesArray)}`;
    },

    addWebIdToDirectory: async () => {
      // Experimental feature
      try {
          await app.web.addWebIdToDirectory(webIdUri, displayName);
      } catch(err) {
          return err;
      }
      return `Resolves upon data commit to _public directory.`;
    },

    getWebIds: async () => {
      // Experimental feature
      try {
          var webIdArray = await app.web.getWebIds();
      } catch(err) {
          return err;
      }
      return `Returns array of Web Ids: ${JSON.stringify(webIdArray)}`;
    }
  }
}
