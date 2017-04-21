import { CONSTANTS, APP_INFO } from './constants';
import { initializeApp, fromAuthURI } from 'safe-app';
import { getAuthData, saveAuthData, clearAuthData, hashPublicId, genKeyPair,
                    encrypt, decrypt, genServiceInfo } from './utils/app_utils';

const requestAuth = () => {
  return app.auth.genAuthUri(APP_INFO.permissions, APP_INFO.ops)
    .then((resp) => app.auth.openUri(resp.uri))
}

export const authApp = () => {
  return initializeApp(APP_INFO.info)
    .then((app) => {
      if (process.env.SAFE_FAKE_AUTH) {
        return app.auth.loginForTest(APP_INFO.permissions, APP_INFO.ops);
      } else {
        let uri = getAuthData();
        if (uri) {
          return fromAuthURI(APP_INFO.info, uri)
            .then((app) => app, (err) => {
              console.warn("Auth URI stored is not valid anymore, it needs to be authorised again: ", err);
              clearAuthData();
              return requestAuth();
            })
        }

        return requestAuth();
      }
    });
}

export const connect = (uri) => {
  return fromAuthURI(APP_INFO.info, uri)
          .then((app) => {
            saveAuthData(uri);
            return app;
          });
}

export const readConfig = (app) => {
  let account = {};
  return app.auth.refreshContainerAccess()
      //.then(() => app.auth.getHomeContainer())
      .then(() => app.mutableData.newPublic(hashPublicId('home_container'), 15004)) //FIXME: use home container instead
      //.then((md) => md.encryptKey(CONSTANTS.MD_KEY_EMAIL_INBOX).then((key) => md.get(key))
      .then((md) => md.get(CONSTANTS.MD_KEY_EMAIL_INBOX)
        .then((value) => app.mutableData.fromSerial(value.buf))
        .then((inbox_md) => account.inbox_md = inbox_md)
        //.then(() => md.encryptKey(CONSTANTS.MD_KEY_EMAIL_ARCHIVE).then((key) => md.get(key)))
        .then(() => md.get(CONSTANTS.MD_KEY_EMAIL_ARCHIVE))
        .then((value) => app.mutableData.fromSerial(value.buf))
        .then((archive_md) => account.archive_md = archive_md)
        //.then(() => md.encryptKey(CONSTANTS.MD_KEY_EMAIL_ID).then((key) => md.get(key)))
        .then(() => md.get(CONSTANTS.MD_KEY_EMAIL_ID))
        .then((value) => account.id = value.buf.toString())
        //.then(() => md.encryptKey(CONSTANTS.MD_KEY_EMAIL_ENC_SECRET_KEY).then((key) => md.get(key)))
        .then(() => md.get(CONSTANTS.MD_KEY_EMAIL_ENC_SECRET_KEY))
        .then((value) => account.enc_sk = value.buf.toString())
        //.then(() => md.encryptKey(CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY).then((key) => md.get(key)))
        .then(() => md.get(CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY))
        .then((value) => account.enc_pk = value.buf.toString())
      )
      .then(() => account);
}

export const writeConfig = (app, account) => {
  let serialised_inbox;
  let serialised_archive;
  return account.inbox_md.serialise()
      .then((serial) => serialised_inbox = serial)
      .then(() => account.archive_md.serialise())
      .then((serial) => serialised_archive = serial)
      .then(() => app.auth.refreshContainerAccess())
      //.then(() => app.auth.getHomeContainer())
      .then(() => app.mutableData.newPublic(hashPublicId('home_container'), 15004)) // FIXME: use home container instead
      .then((md) => md.quickSetup())
      .then((md) => md.getEntries()
        .then((entries) => entries.mutate()
          .then((mut) => mut.insert(CONSTANTS.MD_KEY_EMAIL_INBOX, serialised_inbox)
            .then(() => mut.insert(CONSTANTS.MD_KEY_EMAIL_ARCHIVE, serialised_archive))
            .then(() => mut.insert(CONSTANTS.MD_KEY_EMAIL_ID, account.id))
            .then(() => mut.insert(CONSTANTS.MD_KEY_EMAIL_ENC_SECRET_KEY, account.enc_sk))
            .then(() => mut.insert(CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY, account.enc_pk))
            .then(() => md.applyEntriesMutation(mut))
          )))
      .then(() => account);
}

export const readEmails = (app, md, account, cb) => {
  return md.getEntries()
      .then((entries) => entries.forEach((key, value) => {
          if (key.toString() !== CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY) {
            let entry_key = decrypt(key.toString(), account.enc_sk, account.enc_pk);
            return app.immutableData.fetch(Buffer.from(entry_key, 'hex'))
              .then((immData) => immData.read())
              .then((content) => {
                let decryptedEmail;
                decryptedEmail = JSON.parse(decrypt(content.toString(), account.enc_sk, account.enc_pk));
                cb({ [key]: decryptedEmail });
              })
          }
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
      .then(() => permSet.setAllow('Delete')) //FIXME: this shouldn't be needed
      .then(() => inbox_md.setUserPermissions(null, permSet, 1))
      .then(() => inbox_md);
}

const createArchive = (app) => {
  let archive_md;
  let permSet;
  return app.mutableData.newRandomPublic(CONSTANTS.TAG_TYPE_EMAIL_ARCHIVE) //TODO: make it private
      .then((md) => md.quickSetup())
      .then((md) => archive_md = md)
      .then(() => app.mutableData.newPermissionSet())
      .then((pmSet) => permSet = pmSet)
      .then(() => permSet.setAllow('Insert')) //FIXME: this shouldn't be needed
      .then(() => archive_md.setUserPermissions(null, permSet, 1))
      .then(() => archive_md);
}

const addEmailService = (app, services, serviceName, inbox_serialised) => {
  console.log("ADD EMAIL SERVICE")

  return app.mutableData.newPublic(services, CONSTANTS.TAG_TYPE_DNS)
    .then((services_md) => app.mutableData.newMutation()
      .then((mut) => mut.insert(serviceName, inbox_serialised)
        .then(() => services_md.applyEntriesMutation(mut))
      ))
}

const createPublicIdAndEmailService = (app, pub_names_md, serviceInfo,
                                                          inbox_serialised) => {
  console.log("CREATE PUBLIC ID AND EMAIL SERVICE")

  return app.mutableData.newPublic(serviceInfo.serviceAddr, CONSTANTS.TAG_TYPE_DNS)
      .then((md) => md.quickSetup({ [serviceInfo.serviceName]: inbox_serialised })
        .then((md) => md.getNameAndTag())
        .then((services) => app.mutableData.newMutation()
          .then((mut) => mut.insert(serviceInfo.publicId, services.name)
            .then(() => pub_names_md.applyEntriesMutation(mut))
          ))
      )
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
      .then((md) => newAccount = {id: emailId, inbox_md: inbox, archive_md: md,
                    enc_sk: key_pair.privateKey, enc_pk: key_pair.publicKey})
      .then(() => newAccount.inbox_md.serialise())
      .then((md_serialised) => inbox_serialised = md_serialised)
      .then(() => app.auth.refreshContainerAccess())
      .then(() => app.auth.getAccessContainerInfo('_publicNames'))
      .then((pub_names_md) => pub_names_md.encryptKey(serviceInfo.publicId)
        .then((encrypted_publicId) => pub_names_md.get(encrypted_publicId))
        // FIXME: for some reason I'm not able to read the _publicNames entries
        .then((services) => addService(app, services, serviceInfo.serviceName, inbox_serialised)
          , (err) => {
            if (err.name === 'ERR_NO_SUCH_ENTRY') {
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
        .then(() => email.close())
      );
}

export const storeEmail = (app, email, to) => {
  let serviceInfo = genServiceInfo(to);
  return app.mutableData.newPublic(serviceInfo.serviceAddr, CONSTANTS.TAG_TYPE_DNS)
      .then((md) => md.get(serviceInfo.serviceName))
      .then((service) => app.mutableData.fromSerial(service.buf))
      .then((inbox_md) => inbox_md.get(CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY)
        .then((pk) => writeEmailContent(app, email, pk.buf.toString())
          .then((email_addr) => app.mutableData.newMutation()
            .then((mut) => {
              let entry = encrypt(email_addr.buffer.toString('hex'), pk.buf.toString());
              return mut.insert(entry, entry) //TODO: perhaps we can store additional info in the entry's value
                .then(() => inbox_md.applyEntriesMutation(mut))
            })
          )));
}

export const removeEmail = (app, container, key) => {
  return app.mutableData.newMutation()
      .then((mut) => mut.remove(key, 1)
        // FIXME: this depends on a bug in client_libs
        .then(() => container.applyEntriesMutation(mut))
      )
}

export const archiveEmail = (app, account, key) => {
  return account.inbox_md.get(key)
      .then((email) => app.mutableData.newMutation()
        .then((mut) => mut.insert(key, email.buf)
          .then(() => account.archive_md.applyEntriesMutation(mut))
        )
      )
      .then(() => app.mutableData.newMutation())
      .then((mut) => mut.remove(key, 1)
        // FIXME: this depends on a bug in client_libs
        .then(() => account.inbox_md.applyEntriesMutation(mut))
      )
}
