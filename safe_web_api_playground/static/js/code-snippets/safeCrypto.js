module.exports = {
  safeCrypto: {
    sha3Hash: async () => {
    try {
      hashedString = await window.safeCrypto.sha3Hash(appHandle, '1010101010101')
    } catch (err) {
      return err;
    }
    return `SHA3 Hash generated: ${String.fromCharCode.apply(null, new Uint8Array(res))}`;
    },

    getAppPubSignKey: async () => {
    try {
      pubSignKeyHandle = await window.safeCrypto.getAppPubSignKey(appHandle)
    }catch (err) {
      return err;
    }
    return `Returns applications public signing key handle: ${pubSignKeyHandle}`;
    },

    getAppPubEncKey: async () => {
    try {
      pubEncKeyHandle = await window.safeCrypto.getAppPubEncKey(appHandle)
    }catch (err) {
      return err;
    }
    return `Returns handle to application's public encryption key handle: ${pubEncKeyHandle}`;
    },

    generateEncKeyPair: async () => {
      try {
        encKeyPairHandle = await window.safeCrypto.generateEncKeyPair(appHandle);
      }catch (err) {
        return err;
      }
      return `Returns handle to asymmetric encrypted key pair: ${encKeyPairHandle}`;
    },

    generateSignKeyPair: async () => {
      try {
        signKeyPairHandle = await window.safeCrypto.generateSignKeyPair(appHandle);
      } catch (err) {
        return err;
      }
      return `Returns handle to signing key pair: ${signKeyPairHandle}`;
    },

    pubSignKeyFromRaw: async () => {
      try {
        pubSignKeyHandle = await window.safeCrypto.pubSignKeyFromRaw(appHandle, rawPubSignKey.buffer);
      } catch(err) {
        return err;
      }
      return `Returns handle to public signing key: ${pubSignKeyHandle}`;
    },

    secSignKeyFromRaw: async () => {
      try {
        secSignKeyHandle = await window.safeCrypto.secSignKeyFromRaw(appHandle, rawSecSignKey.buffer);
      } catch(err) {
        return err;
      }
      return `Returns handle to secret signing key: ${secSignKeyHandle}`;
    },

    pubEncKeyFromRaw: async () => {
      try {
        pubEncKeyHandle = await window.safeCrypto.pubEncKeyFromRaw(appHandle, rawPubEncKey.buffer)
      } catch(err) {
        return err;
      }
      return `Returns handle to application's public enryption key handle from raw buffer: ${pubEncKeyHandle}`;
    },

    secEncKeyFromRaw: async () => {
    try {
      secEncKeyHandle = await window.safeCrypto.secEncKeyFromRaw(appHandle, rawSecEncKey.buffer)
    } catch (err) {
      return err;
    }
    return `Returns handle to secret encrypted key: ${secEncKeyHandle}`;
    },

    generateEncKeyPairFromRaw: async () => {
      try {
        encKeyPairHandle = await window.safeCrypto.generateEncKeyPairFromRaw(appHandle, rawPubEncKey.buffer, rawSecEncKey.buffer)
      } catch (err) {
        return err;
      }
      return `Encryption key pair generated from raw strings: ${encKeyPairHandle}`;
    },

    generateSignKeyPairFromRaw: async () => {
      try {
        signKeyPairHandle = await window.safeCrypto.generateSignKeyPairFromRaw(appHandle, rawPubSignKey.buffer, rawSecSignKey.buffer);
      } catch (err) {
        return err;
      }
      return `Returns handle to sign key pair: ${signKeyPairHandle}`;
    },

    generateNonce: async () => {
      try {
        nonce = await window.safeCrypto.generateNonce(appHandle)
      } catch (err) {
        return err;
      }
      return `Nonce generated: ${String.fromCharCode.apply(null, new Uint8Array(nonce.buffer))}`;
    },

  }
}
