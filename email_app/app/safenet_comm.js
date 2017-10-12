import { CONSTANTS, MESSAGES, SAFE_APP_ERROR_CODES } from './constants';
import { initializeApp, fromAuthURI } from '@maidsafe/safe-node-app';
import { getAuthData, saveAuthData, clearAuthData, genRandomEntryKey,
         splitPublicIdAndService, deserialiseArray } from './utils/app_utils';
import pkg from '../package.json';

const APP_INFO = {
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

const DEVELOPMENT = 'dev';
const nodeEnv = process.env.NODE_ENV || DEVELOPMENT

let libPath;

if (nodeEnv === DEVELOPMENT) {
  libPath = CONSTANTS.DEV_LIB_PATH;
} else {
  libPath = CONSTANTS.ASAR_LIB_PATH;
}

const genServiceInfo = (app, emailId) => {
  let serviceInfo = splitPublicIdAndService(emailId);
  return app.crypto.sha3Hash(serviceInfo.publicId)
    .then((hashed) => {
      serviceInfo.serviceAddr = hashed;
      return serviceInfo;
    });
}

const requestShareMdAuth = (app, mdPermissions) => {
  return app.auth.genShareMDataUri(mdPermissions)
    .then((resp) => {
      return app.auth.openUri(resp.uri)
        .then(() => { return null; });
    })
}

const requestAuth = () => {
  return initializeApp(APP_INFO.info, null, { libPath })
    .then((app) => app.auth.genAuthUri(APP_INFO.permissions, APP_INFO.opts)
      .then((resp) => {
        return app.auth.openUri(resp.uri)
          .then(() => { return null; });
      })
    );
}

export const authApp = (netStatusCallback) => {
  if (process.env.SAFE_FAKE_AUTH) {
    return initializeApp(APP_INFO.info, null, { libPath })
      .then((app) => app.auth.loginForTest(APP_INFO.permissions));
  }

  let uri = getAuthData();
  if (uri) {
    return fromAuthURI(APP_INFO.info, uri, netStatusCallback, { libPath })
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
  return fromAuthURI(APP_INFO.info, uri, netStatusCallback, { libPath })
    .then((app) => registeredApp = app)
    .then(() => saveAuthData(uri))
    .then(() => registeredApp.auth.refreshContainersPermissions())
    .then(() => registeredApp);
}

export const reconnect = (app) => {
  return app.reconnect();
}

const fetchPublicIds = (app) => {
  let rawEntries = [];
  let publicIds = [];
  return app.auth.getContainer(APP_INFO.containers.publicNames)
    .then((pubNamesMd) => pubNamesMd.getEntries()
      .then((entries) => entries.forEach((key, value) => {
          rawEntries.push({key, value});
        })
        .then(() => Promise.all(rawEntries.map((entry) => {
          if (entry.value.buf.length === 0) { //FIXME: this condition is a work around for a limitation in safe_core
            return Promise.resolve();
          }

          return pubNamesMd.decrypt(entry.key)
            .then((decKey) => {
              const id = decKey.toString();
              if (id === CONSTANTS.MD_META_KEY) { // Skip the metadata entry
                return Promise.resolve();
              }
              return pubNamesMd.decrypt(entry.value.buf)
                .then((service) => publicIds.push({ id, service }));
            });
        })))
      ))
    .then(() => publicIds);
}

export const fetchEmailIds = (app) => {
  let emailIds = [];

  return fetchPublicIds(app)
    .then((publicIds) => Promise.all(publicIds.map((publicId) => {
        let rawEmailIds = [];
        return app.mutableData.newPublic(publicId.service, CONSTANTS.TAG_TYPE_DNS)
            .then((servicesMd) => servicesMd.getKeys())
            .then((keys) => keys.forEach((key) => {
                rawEmailIds.push(key.toString());
              })
              .then(() => Promise.all(rawEmailIds.map((emailId) => {
                // Let's filter out the services which are not email services,
                // i.e. those which don't have the `@email` postfix.
                // This will filter out the MD metadata entry also.
                const regex = new RegExp('.*(?=' + CONSTANTS.SERVICE_NAME_POSTFIX +'$)', 'g');
                let res = regex.exec(emailId);
                if (res) {
                  emailIds.push(res[0] + ((res[0].length > 0) ? '.' : '') + publicId.id);
                }
              })))
            );
    })))
    .then(() => emailIds);
}

export const readConfig = (app, emailId) => {
  let account = {id: emailId};
  let storedAccount = {}

  return app.auth.getOwnContainer()
    .then((md) => md.encryptKey(emailId).then((key) => md.get(key))
      .then((value) => md.decrypt(value.buf).then((decrypted) => storedAccount = JSON.parse(decrypted)))
      .then(() => app.mutableData.fromSerial(storedAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_INBOX]))
      .then((inboxMd) => account.inboxMd = inboxMd)
      .then(() => app.mutableData.fromSerial(storedAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_ARCHIVE]))
      .then((archiveMd) => account.archiveMd = archiveMd)
      .then(() => account.encSk = storedAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_ENC_SECRET_KEY])
      .then(() => account.encPk = storedAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_ENC_PUBLIC_KEY])
    )
    .then(() => account);
}

const insertEncrypted = (md, mut, key, value) => {
  return md.encryptKey(key)
    .then((encryptedKey) => md.encryptValue(value)
      .then((encryptedValue) => mut.insert(encryptedKey, encryptedValue))
    );
}

export const writeConfig = (app, account) => {
  let emailAccount = {
    [CONSTANTS.ACCOUNT_KEY_EMAIL_ID]: account.id,
    [CONSTANTS.ACCOUNT_KEY_EMAIL_ENC_SECRET_KEY]: account.encSk,
    [CONSTANTS.ACCOUNT_KEY_EMAIL_ENC_PUBLIC_KEY]: account.encPk
  };

  return account.inboxMd.serialise()
    .then((serial) => emailAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_INBOX] = serial)
    .then(() => account.archiveMd.serialise())
    .then((serial) => emailAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_ARCHIVE] = serial)
    .then(() => app.auth.getOwnContainer())
    .then((md) => app.mutableData.newMutation()
      .then((mut) => insertEncrypted(md, mut, account.id, JSON.stringify(emailAccount))
        .then(() => md.applyEntriesMutation(mut))
      ))
    .then(() => account);
}

const decryptEmail = (app, account, key, value, cb) => {
  if (value.length > 0) { //FIXME: this condition is a work around for a limitation in safe_core
    return decrypt(app, value, account.encSk, account.encPk)
      .then(entryValue => app.immutableData.fetch(deserialiseArray(entryValue))
        .then((immData) => immData.read())
        .then((content) => decrypt(app, content, account.encSk, account.encPk)
          .then(decryptedEmail => cb({ id: key, email: JSON.parse(decryptedEmail) }))
        )
      )
  }
}

export const readInboxEmails = (app, account, cb) => {
  return account.inboxMd.getEntries()
    .then((entries) => entries.forEach((key, value) => {
        if (key.toString() !== CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY) {
          return decryptEmail(app, account, key, value.buf, cb);
        }
      })
      .then(() => entries.len())
    );
}

export const readArchivedEmails = (app, account, cb) => {
  return account.archiveMd.getEntries()
    .then((entries) => entries.forEach((key, value) => {
        return decryptEmail(app, account, key, value.buf, cb);
      })
    );
}

const createInbox = (app, encPk) => {
  let baseInbox = {
    [CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY]: encPk
  };
  let inboxMd;
  let permSet;

  return app.mutableData.newRandomPublic(CONSTANTS.TAG_TYPE_INBOX)
    .then((md) => md.quickSetup(baseInbox))
    .then((md) => inboxMd = md)
    .then(() => app.mutableData.newPermissionSet())
    .then((pmSet) => permSet = pmSet)
    .then(() => permSet.setAllow('Insert'))
    .then(() => inboxMd.setUserPermissions(null, permSet, 1))
    .then(() => inboxMd);
}

const createArchive = (app) => {
  return app.mutableData.newRandomPrivate(CONSTANTS.TAG_TYPE_EMAIL_ARCHIVE)
    .then((md) => md.quickSetup());
}

const createPublicIdAndEmailService = (app, pubNamesMd,
                                       serviceInfo, inboxSerialised) => {
  const metadata = {...CONSTANTS.SERVICE_METADATA,
    name: `${CONSTANTS.SERVICE_METADATA.name}: '${serviceInfo.publicId}'`,
    description: `${CONSTANTS.SERVICE_METADATA.description}: '${serviceInfo.publicId}'`
  };

  return app.mutableData.newPublic(serviceInfo.serviceAddr, CONSTANTS.TAG_TYPE_DNS)
    .then((md) => md.quickSetup({ [serviceInfo.serviceName]: inboxSerialised },
                                  metadata.name, metadata.description))
    .then((_) => app.mutableData.newMutation()
      .then((mut) => insertEncrypted(pubNamesMd, mut, serviceInfo.publicId, serviceInfo.serviceAddr)
        .then(() => pubNamesMd.applyEntriesMutation(mut))
      ));
}

const genNewAccount = (app, id) => {
  let inboxMd;
  return genKeyPair(app)
    .then((keyPair) => createInbox(app, keyPair.publicKey)
      .then((md) => inboxMd = md)
      .then(() => createArchive(app))
      .then((archiveMd) => ({id, inboxMd, archiveMd,
                            encSk: keyPair.privateKey,
                            encPk: keyPair.publicKey}))
    );
}

const registerEmailService = (app, serviceToRegister) => {
  let inboxSerialised;
  let newAccount;
  return genNewAccount(app, serviceToRegister.emailId)
    .then((account) => newAccount = account)
    .then(() => newAccount.inboxMd.serialise())
    .then((serialised) => inboxSerialised = serialised)
    .then(() => app.mutableData.newPublic(serviceToRegister.servicesXorName, CONSTANTS.TAG_TYPE_DNS))
    .then((md) => app.mutableData.newMutation()
      .then((mut) => mut.insert(serviceToRegister.serviceName, inboxSerialised)
        .then(() => md.applyEntriesMutation(mut))
      )
    )
    .then(() => newAccount);
}

export const createEmailService = (app, servicesXorName, serviceInfo) => {
  const emailService = {
    servicesXorName,
    emailId: serviceInfo.emailId,
    serviceName: serviceInfo.serviceName
  };

  return app.crypto.getAppPubSignKey()
    .then((appSignKey) => app.mutableData.newPublic(servicesXorName, CONSTANTS.TAG_TYPE_DNS)
      .then((md) => md.getUserPermissions(appSignKey)) // FIXME: the permissions it has could not be enough
      .then(() => registerEmailService(app, emailService).then((newAccount) => ({ newAccount }))
        , (err) => requestShareMdAuth(app,
            [{ type_tag: CONSTANTS.TAG_TYPE_DNS,
               name: servicesXorName,
               perms: ['Insert']
             }] )
          .then(() => emailService)
      ));
}

export const setupAccount = (app, emailId) => {
  let serviceInfo;
  return genServiceInfo(app, emailId)
    .then((info) => serviceInfo = info)
    .then(() => app.auth.getContainer(APP_INFO.containers.publicNames))
    .then((pubNamesMd) => pubNamesMd.encryptKey(serviceInfo.publicId).then((key) => pubNamesMd.get(key))
      // If service container already exists, try to add email service
      .then((encryptedAddr) => pubNamesMd.decrypt(encryptedAddr.buf)
        .then((servicesXorName) => createEmailService(app, servicesXorName, serviceInfo))
      , (err) => { // ...if not then create it
        if (err.code !== SAFE_APP_ERROR_CODES.ERR_NO_SUCH_ENTRY) {
          throw err;
        }
        // The public ID doesn't exist in _publicNames
        return genNewAccount(app, serviceInfo.emailId)
          .then((newAccount) => newAccount.inboxMd.serialise()
            .then((inboxSerialised) => createPublicIdAndEmailService(app,
                                pubNamesMd, serviceInfo, inboxSerialised))
            .then(() => ({ newAccount }))
          )
      })
    );
}

export const connectWithSharedMd = (app, uri, serviceToRegister) => {
  let inboxSerialised;
  let newAccount;
  return app.auth.loginFromURI(uri)
    .then(() => app.auth.refreshContainersPermissions())
    .then(() => registerEmailService(app, serviceToRegister));
}

const writeEmailContent = (app, email, pk) => {
  return encrypt(app, JSON.stringify(email), pk)
    .then(encryptedEmail => app.immutableData.create()
       .then((email) => email.write(encryptedEmail)
         .then(() => app.cipherOpt.newPlainText())
         .then((cipherOpt) => email.close(cipherOpt))
       )
    )
}

export const storeEmail = (app, email, to) => {
  let serviceInfo;
  return genServiceInfo(app, to)
    .then((info) => serviceInfo = info)
    .then(() => app.mutableData.newPublic(serviceInfo.serviceAddr, CONSTANTS.TAG_TYPE_DNS))
    .then((md) => md.get(serviceInfo.serviceName))
    .catch((err) => {throw MESSAGES.EMAIL_ID_NOT_FOUND})
    .then((service) => app.mutableData.fromSerial(service.buf))
    .then((inboxMd) => inboxMd.get(CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY)
      .then((pk) => writeEmailContent(app, email, pk.buf.toString())
        .then((emailAddr) => app.mutableData.newMutation()
          .then((mut) => {
            let entryKey = genRandomEntryKey();
            return encrypt(app, emailAddr, pk.buf.toString())
              .then(entryValue => mut.insert(entryKey, entryValue)
                .then(() => inboxMd.applyEntriesMutation(mut))
              )
          })
        )));
}

export const removeEmail = (app, container, key) => {
  return app.mutableData.newMutation()
    .then((mut) => mut.remove(key, 1)
      .then(() => container.applyEntriesMutation(mut))
    )
}

export const archiveEmail = (app, account, key) => {
  let newEntryKey = genRandomEntryKey();
  return account.inboxMd.get(key)
    .then((xorName) => app.mutableData.newMutation()
      .then((mut) => mut.insert(newEntryKey, xorName.buf)
        .then(() => account.archiveMd.applyEntriesMutation(mut))
      )
    )
    .then(() => app.mutableData.newMutation())
    .then((mut) => mut.remove(key, 1)
      .then(() => account.inboxMd.applyEntriesMutation(mut))
    )
}

const genKeyPair = (app) => {
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

const encrypt = (app, input, pk) => {
  if(Array.isArray(input)) {
    input = input.toString();
  }

  let stringToBuffer = Buffer.from(pk, 'hex');

  return app.crypto.pubEncKeyKeyFromRaw(stringToBuffer)
    .then(pubEncKeyAPI => pubEncKeyAPI.encryptSealed(input))
};

const decrypt = (app, cipherMsg, sk, pk) => {
  return app.crypto.generateEncKeyPairFromRaw(Buffer.from(pk, 'hex'), Buffer.from(sk, 'hex'))
    .then(keyPair => keyPair.decryptSealed(cipherMsg))
    .then((decrypted) => decrypted.toString())
};
