module.exports = {
  crypto: {
    sha3Hash: async () => {
    try {
      hashedString = await app.crypto.sha3Hash('1010101010101')
    } catch (err) {
      return err;
    }
    return `SHA3 Hash generated: ${hashedString}`;
    },

    getAppPubSignKey: async () => {
    try {
      pubSignKey = await app.crypto.getAppPubSignKey()
    }catch (err) {
      return err;
    }
    return `Returns applications public signing key handle: ${pubSignKey}`;
    },

    getAppPubEncKey: async () => {
    try {
      pubEncKey = await app.crypto.getAppPubEncKey()
    }catch (err) {
      return err;
    }
    return `Returns handle to application's public encryption key handle: ${pubEncKey}`;
    },

    generateEncKeyPair: async () => {
      try {
        encKeyPair = await app.crypto.generateEncKeyPair();
      }catch (err) {
        return err;
      }
      return `Returns handle to asymmetric encrypted key pair: ${encKeyPair}`;
    },

    generateSignKeyPair: async () => {
      try {
        signKeyPair = await app.crypto.generateSignKeyPair();
      } catch (err) {
        return err;
      }
      return `Returns handle to signing key pair: ${signKeyPair}`;
    },

    pubSignKeyFromRaw: async () => {
      try {
        pubSignKey = await app.crypto.pubSignKeyFromRaw(rawPubSignKey.buffer);
      } catch(err) {
        return err;
      }
      return `Returns handle to public signing key: ${pubSignKey}`;
    },

    secSignKeyFromRaw: async () => {
      try {
        secSignKey = await app.crypto.secSignKeyFromRaw(rawSecSignKey.buffer);
      } catch(err) {
        return err;
      }
      return `Returns handle to secret signing key: ${secSignKey}`;
    },

    pubEncKeyFromRaw: async () => {
      try {
        pubEncKey = await app.crypto.pubEncKeyFromRaw(rawPubEncKey.buffer)
      } catch(err) {
        return err;
      }
      return `Returns handle to application's public enryption key handle from raw buffer: ${pubEncKey}`;
    },

    secEncKeyFromRaw: async () => {
    try {
      secEncKey = await app.crypto.secEncKeyFromRaw(rawSecEncKey.buffer)
    } catch (err) {
      return err;
    }
    return `Returns handle to secret encrypted key: ${secEncKey}`;
    },

    generateEncKeyPairFromRaw: async () => {
      try {
        encKeyPair = await app.crypto.generateEncKeyPairFromRaw(rawPubEncKey.buffer, rawSecEncKey.buffer)
      } catch (err) {
        return err;
      }
      return `Encryption key pair generated from raw strings: ${encKeyPair}`;
    },

    generateSignKeyPairFromRaw: async () => {
      try {
        signKeyPair = await app.crypto.generateSignKeyPairFromRaw(rawPubSignKey.buffer, rawSecSignKey.buffer);
      } catch (err) {
        return err;
      }
      return `Returns handle to sign key pair: ${signKeyPair}`;
    },

    generateNonce: async () => {
      try {
        nonce = await app.crypto.generateNonce()
      } catch (err) {
        return err;
      }
      return `Nonce generated: ${nonce.buffer}`;
    }
  }
}
