import { shell } from 'electron';
import { CONSTANTS, MESSAGES } from './constants';
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

export const authApp = () => {
  if (process.env.SAFE_FAKE_AUTH) {
    return initializeApp(APP_INFO.info)
        .then((app) => app.auth.loginForTest(APP_INFO.permissions));
  }

  let uri = getAuthData();
  if (uri) {
    console.log("we have uri so connect");
    return fromAuthURI(APP_INFO.info, uri, (state) => {
        console.log("New STATE desde cached: ", state);
      })
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

export const connect = (uri) => {
  let registered_app;
  return fromAuthURI(APP_INFO.info, uri, (state) => {
            console.log("New STATE: ", state);
          })
          .then((app) => registered_app = app)
          .then(() => saveAuthData(uri))
          .then(() => registered_app.auth.refreshContainersPermissions())
          .then(() => registered_app);
}

export const readConfig = (app) => {
  let account = {};
  return app.auth.getHomeContainer()
      .then((md) => md.encryptKey(CONSTANTS.MD_KEY_EMAIL_INBOX).then((key) => md.get(key))
        .then((value) => md.decrypt(value.buf).then((decrypted) => app.mutableData.fromSerial(decrypted)))
        .then((inbox_md) => account.inbox_md = inbox_md)
        .then(() => md.encryptKey(CONSTANTS.MD_KEY_EMAIL_ARCHIVE).then((key) => md.get(key)))
        .then((value) => md.decrypt(value.buf).then((decrypted) => app.mutableData.fromSerial(decrypted)))
        .then((archive_md) => account.archive_md = archive_md)
        .then(() => md.encryptKey(CONSTANTS.MD_KEY_EMAIL_ID).then((key) => md.get(key)))
        .then((value) => md.decrypt(value.buf).then((decrypted) => account.id = decrypted.toString()))
        .then(() => md.encryptKey(CONSTANTS.MD_KEY_EMAIL_ENC_SECRET_KEY).then((key) => md.get(key)))
        .then((value) => md.decrypt(value.buf).then((decrypted) => account.enc_sk = decrypted.toString()))
        .then(() => md.encryptKey(CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY).then((key) => md.get(key)))
        .then((value) => md.decrypt(value.buf).then((decrypted) => account.enc_pk = decrypted.toString()))
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
  let serialised_inbox;
  let serialised_archive;
  return account.inbox_md.serialise()
      .then((serial) => serialised_inbox = serial)
      .then(() => account.archive_md.serialise())
      .then((serial) => serialised_archive = serial)
      .then(() => app.auth.getHomeContainer())
      .then((md) => app.mutableData.newMutation()
        .then((mut) => insertEncrypted(md, mut, CONSTANTS.MD_KEY_EMAIL_INBOX, serialised_inbox)
          .then(() => insertEncrypted(md, mut, CONSTANTS.MD_KEY_EMAIL_ARCHIVE, serialised_archive))
          .then(() => insertEncrypted(md, mut, CONSTANTS.MD_KEY_EMAIL_ID, account.id))
          .then(() => insertEncrypted(md, mut, CONSTANTS.MD_KEY_EMAIL_ENC_SECRET_KEY, account.enc_sk))
          .then(() => insertEncrypted(md, mut, CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY, account.enc_pk))
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
      .then((md) => md.quickSetup({ [serviceInfo.serviceName]: inbox_serialised }))
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
            if (err.code === -106) {
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
