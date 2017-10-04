import { shell } from 'electron';
import { initializeApp, fromAuthURI } from '@maidsafe/safe-node-app';
import { getAuthData, saveAuthData, clearAuthData,
  splitPublicIdAndService, parseUrl } from '../utils/app_utils';
import pkg from '../../package.json';

export const APP_INFO = {
  info: {
    id: pkg.identifier,
    scope: null,
    name: pkg.productName,
    vendor: pkg.vendor
  },
  opts: {
    own_container: true
  },
  containers: {
    publicNames: '_publicNames'
  },
  permissions: {
    _publicNames: ['Read', 'Insert']
  }
};

export const genServiceInfo = (app, emailId) => {
  let serviceInfo = splitPublicIdAndService(emailId);
  return app.crypto.sha3Hash(serviceInfo.publicId)
    .then((hashed) => {
      serviceInfo.serviceAddr = hashed;
      return serviceInfo;
    });
}

export const requestShareMdAuth = (app, mdPermissions) => {
  return app.auth.genShareMDataUri(mdPermissions)
    .then((resp) => {
      shell.openExternal(parseUrl(resp.uri));
      return null;
    });
}

const requestAuth = () => {
  return initializeApp(APP_INFO.info)
    .then((app) => app.auth.genAuthUri(APP_INFO.permissions, APP_INFO.opts)
      .then((resp) => {
        shell.openExternal(parseUrl(resp.uri));
        return null;
      })
    );
}

export const authApp = (netStatusCallback) => {
  if (process.env.SAFE_FAKE_AUTH) {
    return initializeApp(APP_INFO.info)
      .then((app) => app.auth.loginForTest(APP_INFO.permissions));
  }

  let uri = getAuthData();
  if (uri) {
    return fromAuthURI(APP_INFO.info, uri, netStatusCallback)
      .then((registeredApp) => registeredApp.auth.refreshContainersPermissions()
        .then(() => registeredApp)
      )
      .catch((err) => {
        console.warn("Auth URI stored is not valid anymore, app needs to be re-authorised.");
        clearAuthData();
        return requestAuth();
      });
  }

  return requestAuth();
}

export const connect = (uri, netStatusCallback) => {
  let registeredApp;
  return fromAuthURI(APP_INFO.info, uri, netStatusCallback)
    .then((app) => registeredApp = app)
    .then(() => saveAuthData(uri))
    .then(() => registeredApp.auth.refreshContainersPermissions())
    .then(() => registeredApp);
}

export const reconnect = (app) => {
  return app.reconnect();
}

export const genKeyPair = (app) => {
  let rawKeyPair = {};
  return app.crypto.generateEncKeyPair()
    .then(keyPair => keyPair.pubEncKey.getRaw()
      .then(rawPubEncKey => {
        rawKeyPair.publicKey = rawPubEncKey.buffer.toString('hex');
        return;
      })
      .then(() => keyPair.secEncKey.getRaw())
      .then(rawSecEncKey => {
        rawKeyPair.privateKey = rawSecEncKey.buffer.toString('hex');
        return rawKeyPair;
      })
    )
}

export const encrypt = (app, input, pk) => {
  if(Array.isArray(input)) {
    input = input.toString();
  }

  let stringToBuffer = Buffer.from(pk, 'hex');

  return app.crypto.pubEncKeyKeyFromRaw(stringToBuffer)
    .then(pubEncKeyAPI => pubEncKeyAPI.encryptSealed(input))
};

export const decrypt = (app, cipherMsg, sk, pk) => {
  return app.crypto.generateEncKeyPairFromRaw(Buffer.from(pk, 'hex'), Buffer.from(sk, 'hex'))
    .then(keyPair => keyPair.decryptSealed(cipherMsg))
    .then((decrypted) => decrypted.toString())
};
