module.exports = (type) => {
      switch(type) {
        case 'valuesHandle':
          return 'valuesHandle not yet defined. Use safeMutableData.getValues to first obtain valuesHandle';
          break;

        case 'keysHandle':
          return 'keysHandle not yet defined. Use safeMutableData.getKeys to first obtain keysHandle';
          break;

        case 'entriesHandle':
          return 'entriesHandle not yet defined. Use safeMutableData.getEntries or .newEntries to first obtain entriesHandle';
          break;

        case 'mutationHandle':
          return 'mutationHandle not yet defined. Use safeMutableData.newMutation to first obtain mutationHandle';
          break;

        case 'permsHandle':
          return 'permsHandle not yet defined. Use safeMutableData.getPermissions to first obtain permsHandle';
          break;

        case 'nfsHandle':
          return 'nfsHandle not yet defined. Use safeMutableData.emulateAs to first obtain nfsHandle';
          break;

        case 'idWriterHandle':
          return 'idWriterHandle not yet defined. Use safeImmutableData.create to first obtain idWriterHandle';
          break;

        case 'idReaderHandle':
          return 'idReaderHandle not yet defined. Use safeImmutableData.fetch to first obtain idReaderHandle';
          break;

        case 'mdHandle':
          return 'mdHandle not yet defined. Use one of the first 4 functions from the safeMutableData module to first obtain mdHandle';
          break;

        case 'nonce':
          return 'nonce not yet defined. Use safeCrypto.generateNonce to first obtain nonce';
          break;

        case 'permSetHandle':
          return 'permSetHandle not yet defined. Use safeMutableData.newPermissionSet to first obtain permSetHandle';
          break;

        case 'cipherOptHandle':
          return 'cipherOptHandle not yet defined. Use either safeCipherOpt.newPlainText, safeCipherOpt.newSymmetric, or safeCipherOpt.newAsymmetric to first obtain cipherOptHandle';
          break;

        case 'authUri':
          return 'authUri not yet defined. Use safeApp.authorise to first obtain authUri';
          break;

        case 'appHandle':
          return 'appHandle not yet defined. Use safeApp.initialise to first obtain appHandle';
          break;

        case 'encryptedKey':
          return 'encryptedKey not yet defined. Use safeMutableData.encryptKey to first obtain encryptedKey';
          break;

        case 'encryptedValue':
          return 'encryptedValue not yet defined. Use safeMutableData.encryptValue to first obtain encryptedValue';
          break;

        case 'signKeyHandle':
          return 'signKeyHandle not yet defined. Use safeCrypto.getAppPubSignKey to first obtain signKeyHandle';
          break;

        case 'version':
          return 'version not yet defined. Use safeMutableData.getVersion to first obtain version';
          break;

        case 'fileContextHandle':
          return 'fileContextHandle not yet defined. Use safeNfs.create to first obtain fileContextHandle';
          break;

        case 'pubEncKeyHandle':
          return 'pubEncKeyHandle not yet defined. Use safeCrypto.getAppPubEncKey to first obtain pubEncKeyHandle';
          break;

        case 'keyPairHandle':
          return 'keyPairHandle not yet defined. Use safeCrypto.generateEncKeyPair to first obtain keyPairHandle';
          break;

        case 'rawSignKey':
          return 'rawSignKey not yet defined. Use safeCrypto.getSignKeyFromRaw to first obtain rawSignKey';
          break;

        case 'rawPubEncKey':
          return 'rawPubEncKey not yet defined. Use safeCryptoPubEncKey.getRaw to first obtain rawPubEncKey';
          break;

        case 'rawSecEncKey':
          return 'rawSecEncKey not yet defined. Use safeCryptoSecEncKey.getRaw to first obtain rawSecEncKey';
          break;

        case 'secEncKeyHandle':
          return 'secEncKeyHandle not yet defined. Use safeCryptoKeyPair.getSecEncKey to first obtain secEncKeyHandle';
          break;

        case 'encryptedBuffer':
          return 'encryptedBuffer not yet defined. Use safeCryptoPubEncKey.encryptSealed to first obtain encryptedBuffer';
          break;

        case 'idAddress':
          return 'idAddress not yet defined. Use safeImmutableData.closeWriter to first obtain idAddress';
          break;

        case 'serializedMD':
          return 'serializedMD not yet defined. Use safeMutableData.serialise to first obtain serializedMD';
          break;

        case 'hashedString ':
          return 'hashedString not yet defined. Use safeCrypto.sha3Hash to first obtain hashedString';
          break;

        default:
          return 'Error not yet recognized. Please inform developer.';
      }
}

