import { shell } from 'electron';
import { CONSTANTS, MESSAGES, SAFE_APP_ERROR_CODES } from './constants';
import { initializeApp, fromAuthURI } from 'safe-app';
import { getAuthData, saveAuthData, clearAuthData, hashPublicId, genRandomEntryKey,
         genKeyPair, encrypt, decrypt, genServiceInfo, deserialiseArray, parseUrl } from './utils/app_utils';
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
    _publicNames: ['Read', 'Insert', 'Update']
  }
};

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
      .then((registered_app) => registered_app.auth.refreshContainersPermissions()
        .then(() => registered_app)
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
  let registered_app;
  return fromAuthURI(APP_INFO.info, uri, netStatusCallback)
          .then((app) => registered_app = app)
          .then(() => saveAuthData(uri))
          .then(() => registered_app.auth.refreshContainersPermissions())
          .then(() => registered_app);
}

export const reconnect = (app) => {
  return app.reconnect();
}

const fetchPublicIds = (app) => {
  let rawEntries = [];
  let publicIds = [];
  return app.auth.getContainer(APP_INFO.containers.publicNames)
      .then((pub_names_md) => pub_names_md.getEntries()
        .then((entries) => entries.forEach((key, value) => {
            rawEntries.push({key, value});
          })
          .then(() => Promise.all(rawEntries.map((entry) => {
            if (entry.value.buf.length === 0) { //FIXME: this condition is a work around for a limitation in safe_core
              return Promise.resolve();
            }

            return pub_names_md.decrypt(entry.key)
              .then((decKey) => pub_names_md.decrypt(entry.value.buf)
                .then((decVal) => publicIds.push({
                    id: decKey.toString(),
                    service: decVal
                  })
                ));
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
            .then((services_md) => services_md.getKeys())
            .then((keys) => keys.forEach((key) => {
                rawEmailIds.push(key.toString());
              })
              .then(() => Promise.all(rawEmailIds.map((emailId) => {
                // Let's filter out the services which are not email services,
                // i.e. those which don't have the `@email` postfix
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

  return app.auth.getHomeContainer()
      .then((md) => md.encryptKey(emailId).then((key) => md.get(key))
        .then((value) => md.decrypt(value.buf).then((decrypted) => storedAccount = JSON.parse(decrypted)))
        .then(() => app.mutableData.fromSerial(storedAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_INBOX]))
        .then((inbox_md) => account.inbox_md = inbox_md)
        .then(() => app.mutableData.fromSerial(storedAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_ARCHIVE]))
        .then((archive_md) => account.archive_md = archive_md)
        .then(() => account.enc_sk = storedAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_ENC_SECRET_KEY])
        .then(() => account.enc_pk = storedAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_ENC_PUBLIC_KEY])
      )
      .then(() => account);
}

const insertEncrypted = (md, mut, key, value) => {
  return md.encryptKey(key)
      .then((encrypted_key) => md.encryptValue(value)
        .then((encrypted_value) => mut.insert(encrypted_key, encrypted_value))
      );
}

export const writeConfig = (app, account) => {
  let emailAccount = {
    [CONSTANTS.ACCOUNT_KEY_EMAIL_ID]: account.id,
    [CONSTANTS.ACCOUNT_KEY_EMAIL_ENC_SECRET_KEY]: account.enc_sk,
    [CONSTANTS.ACCOUNT_KEY_EMAIL_ENC_PUBLIC_KEY]: account.enc_pk
  };

  return account.inbox_md.serialise()
      .then((serial) => emailAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_INBOX] = serial)
      .then(() => account.archive_md.serialise())
      .then((serial) => emailAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_ARCHIVE] = serial)
      .then(() => app.auth.getHomeContainer())
      .then((md) => app.mutableData.newMutation()
        .then((mut) => insertEncrypted(md, mut, account.id, JSON.stringify(emailAccount))
          .then(() => md.applyEntriesMutation(mut))
        ))
      .then(() => account);
}

const decryptEmail = (app, account, key, value, cb) => {
  if (value.length > 0) { //FIXME: this condition is a work around for a limitation in safe_core
    let entry_value = decrypt(value, account.enc_sk, account.enc_pk);
    return app.immutableData.fetch(deserialiseArray(entry_value))
      .then((immData) => immData.read())
      .then((content) => {
        let decryptedEmail;
        decryptedEmail = JSON.parse(decrypt(content.toString(), account.enc_sk, account.enc_pk));
        cb({ [key]: decryptedEmail });
      });
  }
}

export const readInboxEmails = (app, account, cb) => {
  return account.inbox_md.getEntries()
      .then((entries) => entries.forEach((key, value) => {
          if (key.toString() !== CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY) {
            return decryptEmail(app, account, key, value.buf.toString(), cb);
          }
        })
      );
}

export const readArchivedEmails = (app, account, cb) => {
  return account.archive_md.getEntries()
      .then((entries) => entries.forEach((key, value) => {
          return decryptEmail(app, account, key, value.buf.toString(), cb);
        })
      );
}

const createInbox = (app, enc_pk) => {
  let base_inbox = {
    [CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY]: enc_pk
  };
  let inbox_md;
  let permSet;

  return app.mutableData.newRandomPublic(CONSTANTS.TAG_TYPE_INBOX)
      .then((md) => md.quickSetup(base_inbox))
      .then((md) => inbox_md = md)
      .then(() => app.mutableData.newPermissionSet())
      .then((pmSet) => permSet = pmSet)
      .then(() => permSet.setAllow('Insert'))
      .then(() => inbox_md.setUserPermissions(null, permSet, 1))
      .then(() => inbox_md);
}

const createArchive = (app) => {
  return app.mutableData.newRandomPrivate(CONSTANTS.TAG_TYPE_EMAIL_ARCHIVE)
      .then((md) => md.quickSetup());
}

const addEmailService = (app, serviceInfo, inbox_serialised) => {
  return app.mutableData.newPublic(serviceInfo.serviceAddr, CONSTANTS.TAG_TYPE_DNS)
      .then((md) => md.getVersion()
        .then((version) => {
          return md.getEntries()
            .then((entries) => entries.insert(serviceInfo.serviceName, inbox_serialised))
            .then(() => md);
        }, (err) => {
          if (err.code === SAFE_APP_ERROR_CODES.ERR_DATA_NOT_FOUND) {
            return md.quickSetup({ [serviceInfo.serviceName]: inbox_serialised });
          }
          throw err;
        })
      );
}

const createPublicIdAndEmailService = (app, pub_names_md, serviceInfo,
                                                          inbox_serialised) => {
  return addEmailService(app, serviceInfo, inbox_serialised)
      .then((md) => md.getNameAndTag())
      .then((services) => app.mutableData.newMutation()
        .then((mut) => insertEncrypted(pub_names_md, mut, serviceInfo.publicId, services.name)
          .then(() => pub_names_md.applyEntriesMutation(mut))
        ))
}

export const setupAccount = (app, emailId) => {
  let newAccount = {};
  let inbox_serialised;
  let inbox;
  let key_pair = genKeyPair();
  let serviceInfo = genServiceInfo(emailId);

  return createInbox(app, key_pair.publicKey)
      .then((md) => inbox = md)
      .then(() => createArchive(app))
      .then((md) => newAccount = {id: serviceInfo.emailId, inbox_md: inbox, archive_md: md,
                    enc_sk: key_pair.privateKey, enc_pk: key_pair.publicKey})
      .then(() => newAccount.inbox_md.serialise())
      .then((md_serialised) => inbox_serialised = md_serialised)
      .then(() => app.auth.getContainer(APP_INFO.containers.publicNames))
      .then((pub_names_md) => pub_names_md.encryptKey(serviceInfo.publicId).then((key) => pub_names_md.get(key))
        .then((services) => addEmailService(app, serviceInfo, inbox_serialised)
          , (err) => {
            if (err.code === SAFE_APP_ERROR_CODES.ERR_NO_SUCH_ENTRY) {
              return createPublicIdAndEmailService(app, pub_names_md,
                                                serviceInfo, inbox_serialised);
            }
            throw err;
          })
      )
      .then(() => newAccount);
}

const writeEmailContent = (app, email, pk) => {
  const encryptedEmail = encrypt(JSON.stringify(email), pk);

  return app.immutableData.create()
      .then((email) => email.write(encryptedEmail)
        .then(() => app.cipherOpt.newPlainText())
        .then((cipherOpt) => email.close(cipherOpt))
      );
}

export const storeEmail = (app, email, to) => {
  let serviceInfo = genServiceInfo(to);
  return app.mutableData.newPublic(serviceInfo.serviceAddr, CONSTANTS.TAG_TYPE_DNS)
      .then((md) => md.get(serviceInfo.serviceName))
      .catch((err) => {throw MESSAGES.EMAIL_ID_NOT_FOUND})
      .then((service) => app.mutableData.fromSerial(service.buf))
      .then((inbox_md) => inbox_md.get(CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY)
        .then((pk) => writeEmailContent(app, email, pk.buf.toString())
          .then((email_addr) => app.mutableData.newMutation()
            .then((mut) => {
              let entry_key = genRandomEntryKey();
              let entry_value = encrypt(email_addr.toString(), pk.buf.toString());
              return mut.insert(entry_key, entry_value)
                .then(() => inbox_md.applyEntriesMutation(mut))
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
  let new_entry_key = genRandomEntryKey();
  return account.inbox_md.get(key)
      .then((xorName) => app.mutableData.newMutation()
        .then((mut) => mut.insert(new_entry_key, xorName.buf)
          .then(() => account.archive_md.applyEntriesMutation(mut))
        )
      )
      .then(() => app.mutableData.newMutation())
      .then((mut) => mut.remove(key, 1)
        .then(() => account.inbox_md.applyEntriesMutation(mut))
      )
}
