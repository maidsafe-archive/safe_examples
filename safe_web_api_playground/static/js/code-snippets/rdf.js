module.exports = {
  rdf: {
    setId: async () => {
        // Experimental feature
        // ID in this context refers to the current RDF graph
        const id = rdf.sym("safe://pluto.astronomy");
        rdf.setId(id.uri);
        return `Graph ID set: ${rdf.id}`;
    },

    namespace: async () => {
        // Experimental feature
        const DBP = rdf.namespace( 'http://dbpedia.org/resource/' );
        const resourceNode= DBP("Dwarf_planet");
        return JSON.stringify(resourceNode);
    },

    literal: async () => {
        // Experimental feature
        const discoveryDate = new Date("18 Feb 1930");
        const dateTimeDataType = "http://www.w3.org/2001/XMLSchema#dateTime";
        const literalNode = rdf.literal(discoveryDate.toISOString(), dateTimeDataType);
        return JSON.stringify(literalNode);
    },

    bnode: async () => {
        // Experimental feature
        const blankNode = rdf.bnode();
        return JSON.stringify(blankNode);
    },

    sym: async () => {
        // Experimental feature
        // Used to create a node identified by an URI
        const predicateUri = "http://dbpedia.org/ontology/discovered";
        return rdf.sym(predicateUri);
    },

    add: async () => {
        // Experimental feature
        const id = rdf.sym("safe://pluto.astronomy");
        rdf.setId(id.uri);
        const DBP = rdf.namespace('http://dbpedia.org/resource/');
        const discoveryDate = new Date("18 Feb 1930");
        const dateTimeDataType = "http://www.w3.org/2001/XMLSchema#dateTime";
        const literalNode = rdf.literal(discoveryDate.toISOString(), dateTimeDataType);
        const triples = [
            {
                predicate : rdf.vocabs.RDFS('isDefinedBy'),
                object : DBP('Pluto')
            },
            {
                predicate : rdf.sym("http://dbpedia.org/property/atmosphereComposition"),
                object : DBP("Methane")
            },
            {
                predicate : rdf.vocabs.RDF('type'),
                object : DBP("Dwarf_planet")
            },
            {
                predicate : rdf.sym("http://dbpedia.org/ontology/discovered"),
                object : literalNode
            }
        ];
        // The subject of each triple is the same in this example
        triples.forEach( triple => rdf.add(id, triple.predicate, triple.object) );
    },

    serialise: async () => {
        // Experimental feature
      const mimeType = "text/turtle";
      try {
          serialised = await rdf.serialise(mimeType);
      } catch(err) {
          return err;
      }
        // Best to view in console
        console.log(serialised);
        return `${serialised}`;
    },

    parse: async () => {
        // Experimental feature
      const mimeType = "text/turtle";
      try {
          var parsedData = await rdf.parse(serialised, mimeType, rdf.id);
      } catch(err) {
          return err;
      }
        console.log(parsedData);
        return `Returns parsed data: ${parsedData}`;
    },

    any: async () => {
        // Experimental feature
        const id = rdf.sym("safe://pluto.astronomy");
        const subject = id;
        const predicate = null;
        const object = null;
        return rdf.any(subject, predicate, object);
    },

    each: async () => {
        // Experimental feature
        const id = rdf.sym("safe://pluto.astronomy");
        const subject = id;
        const predicate = null;
        const object = null;
        return rdf.each(subject, predicate, object);
    },

    statementsMatching: async () => {
        // Experimental feature
        const id = rdf.sym("safe://pluto.astronomy");
        const subject = id;
        const predicate = null;
        const object = null;
        return rdf.statementsMatching(subject, predicate, object);
    },

    nowOrWhenFetched: async () => {
      // Experimental feature
      // Fetches RDF triples data stored in the underlying MutableData on the network
      // and loads it in memory as a graph 
      const ids = [];
      const toDecrypt = false;
      try {
          var entryGraphArray = await rdf.nowOrWhenFetched(ids, toDecrypt);
      } catch(err) {
          return err;
      }
        return `Returns array of entry graphs: ${entryGraphArray}`;
    },

    //list: async () => {
    //    const nodes = [rdf.sym('http://id.dbpedia.org/page/Pluto'),rdf.sym('http://it.dbpedia.org/resource/Plutone_(astronomia)/html')];
    //    collection = rdf.collection(nodes);
    //    collection.close;
    //    return;
    //},

    removeMany: async () => {
      // Experimental feature
        const id = rdf.sym("safe://pluto.astronomy");
        const subject = id;
        const predicate = null;
        const object = null;
        return rdf.removeMany(subject, predicate, object);
    },

    commit: async () => {
      // Experimental feature
      const toEncrypt = false;
      try {
          var nameAndTag = await rdf.commit(toEncrypt);
      } catch(err) {
          return err;
      }
      return `Returns MD metadata where committed RDF data is stored. Name: ${nameAndTag.name}, Tag: ${nameAndTag.typeTag}, XOR-URL: ${nameAndTag.xorUrl}`;
    },

    append: async () => {
      // Experimental feature
      try {
          var nameAndTag = await rdf.append();
      } catch(err) {
          return err;
      }
      return `Returns MD for appended RDF data. Name: ${nameAndTag.name}, Tag: ${nameAndTag.typeTag}, XOR-URL: ${nameAndTag.xorUrl}`;
    },

  }
}
