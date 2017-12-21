// import { shell } from 'electron';
import { CONSTANTS as SAFE_CONSTANTS } from '@maidsafe/safe-node-app';

import { CONSTANTS, MESSAGES, SAFE_APP_ERROR_CODES } from '../constants';
import { genRandomEntryKey, deserialiseArray, splitPublicIdAndService } from '../utils/app_utils';
import * as netFns from './network.js';

const fetchPublicIds = async (app) => {
  const rawEntries = [];
  const publicIds = [];
  try {
    const pubNamesMd = await app.auth.getContainer(netFns.APP_INFO.containers.publicNames);
    const entries = await pubNamesMd.getEntries();
    await entries.forEach((key, value) => {
      rawEntries.push({ key, value });
    });

    await Promise.all(rawEntries.map(async (entry) => {
      // FIXME: this condition is a work around for a limitation in safe_core
      if (entry.value.buf.length === 0) {
        return Promise.resolve();
      }

      const decKey = await pubNamesMd.decrypt(entry.key);
      const id = decKey.toString();
      if (id === CONSTANTS.MD_META_KEY) { // Skip the metadata entry
        return Promise.resolve();
      }
      const service = await pubNamesMd.decrypt(entry.value.buf);
      publicIds.push({ id, service });
    }));

    return publicIds;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchEmailIds = async (app) => {
  const emailIds = [];

  try {
    const publicIds = await fetchPublicIds(app);
    await Promise.all(publicIds.map(async (publicId) => {
      const rawEmailIds = [];
      const servicesMd = await app.mutableData.newPublic(publicId.service, CONSTANTS.TAG_TYPE_DNS);
      const keys = await servicesMd.getKeys();
      await keys.forEach((key) => {
        rawEmailIds.push(key.toString());
      });
      await Promise.all(rawEmailIds.map((emailId) => {
        // Let's filter out the services which are not email services,
        // i.e. those which don't have the `@email` postfix.
        // This will filter out the MD metadata entry also.
        const regex = new RegExp(`.*(?=${CONSTANTS.SERVICE_NAME_POSTFIX}$)`, 'g');
        const res = regex.exec(emailId);
        if (res) {
          emailIds.push(res[0] + ((res[0].length > 0) ? '.' : '') + publicId.id);
        }
      }));
    }));
    return emailIds;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const readConfig = async (app, emailId) => {
  const account = { id: emailId };

  try {
    const md = await app.auth.getOwnContainer();
    const value = await md.encryptKey(emailId).then((key) => md.get(key));
    const decrypted = await md.decrypt(value.buf);
    const storedAccount = JSON.parse(decrypted);
    const inboxMd = await app.mutableData.fromSerial(storedAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_INBOX]);
    account.inboxMd = inboxMd;
    const archiveMd = await app.mutableData.fromSerial(storedAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_ARCHIVE]);
    account.archiveMd = archiveMd;
    account.encSk = storedAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_ENC_SECRET_KEY];
    account.encPk = storedAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_ENC_PUBLIC_KEY];
    return account;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/*
* Helper function to encrypt a key and a value, and insert them into/
* a given mutation object, later to be applied
*/
const insertEncrypted = async (md, mut, key, value) => {
  try {
    const encryptedKey = await md.encryptKey(key);
    const encryptedValue = await md.encryptValue(value);
    return mut.insert(encryptedKey, encryptedValue);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/*
* Stores new account information in app's private container
*/
export const writeConfig = async (app, account) => {
  const emailAccount = {
    [CONSTANTS.ACCOUNT_KEY_EMAIL_ID]: account.id,
    [CONSTANTS.ACCOUNT_KEY_EMAIL_ENC_SECRET_KEY]: account.encSk,
    [CONSTANTS.ACCOUNT_KEY_EMAIL_ENC_PUBLIC_KEY]: account.encPk
  };

  try {
    const serialisedInbox = await account.inboxMd.serialise();
    emailAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_INBOX] = serialisedInbox;
    const serialisedArchive = await account.archiveMd.serialise();
    emailAccount[CONSTANTS.ACCOUNT_KEY_EMAIL_ARCHIVE] = serialisedArchive;
    const md = await app.auth.getOwnContainer();
    const mut = await app.mutableData.newMutation();
    await insertEncrypted(md, mut, account.id, JSON.stringify(emailAccount));
    await md.applyEntriesMutation(mut);
    return account;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const decryptEmail = async (app, account, key, value, cb) => {
  if (value.length > 0) { // FIXME: this condition is a work around for a limitation in safe_core
    try {
      const entryValue = await netFns.decrypt(app, value, account.encSk, account.encPk);
      const immData = await app.immutableData.fetch(deserialiseArray(entryValue));
      const content = await immData.read();
      const decryptedEmail = await netFns.decrypt(app, content, account.encSk, account.encPk);
      return cb({ id: key, email: JSON.parse(decryptedEmail) });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
};

export const readInboxEmails = async (app, account, cb) => {
  try {
    const entries = await account.inboxMd.getEntries();
    await entries.forEach((key, value) => {
      if (key.toString() !== CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY) {
        return decryptEmail(app, account, key, value.buf, cb);
      }
    });
    return entries.len();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const readArchivedEmails = async (app, account, cb) => {
  try {
    const entries = await account.archiveMd.getEntries();
    await entries.forEach((key, value) => decryptEmail(app, account, key, value.buf, cb));
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/*
* creates an inbox composed of a Mutable Data structure and permissions/
* on that strucuture for anyone to be able to insert emailService.
*
* Initially saved with a single entry, representing the receiving account's/
* public encryption key
*/
const createInbox = async (app, encPk) => {
  const baseInbox = {
    [CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY]: encPk
  };

  try {
    const inboxMd = await app.mutableData.newRandomPublic(CONSTANTS.TAG_TYPE_INBOX);
    await inboxMd.quickSetup(baseInbox);
    const permSet = ['Insert'];
    await inboxMd.setUserPermissions(SAFE_CONSTANTS.USER_ANYONE, permSet, 1);
    return inboxMd;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/*
* Archive is created as a place to store saved emails, composed of a private/
* Mutable Data structure
*/
const createArchive = async (app) => {
  try {
    const md = await app.mutableData.newRandomPrivate(CONSTANTS.TAG_TYPE_EMAIL_ARCHIVE);
    return md.quickSetup();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/*
* This function will be called when an email service is created, for which/
* a public ID does not already exist.
*/
const createPublicIdAndEmailService = async (
  app, pubNamesMd, serviceInfo, inboxSerialised
) => {
  const metadata = {
    ...CONSTANTS.SERVICE_METADATA,
    name: `${CONSTANTS.SERVICE_METADATA.name}: '${serviceInfo.publicId}'`,
    description: `${CONSTANTS.SERVICE_METADATA.description}: '${serviceInfo.publicId}'`
  };

  try {
    const md = await app.mutableData.newPublic(serviceInfo.serviceAddr, CONSTANTS.TAG_TYPE_DNS);
    await md.quickSetup(
      { [serviceInfo.serviceName]: inboxSerialised }, metadata.name, metadata.description
    );
    const mut = await app.mutableData.newMutation();
    await insertEncrypted(pubNamesMd, mut, serviceInfo.publicId, serviceInfo.serviceAddr);
    return pubNamesMd.applyEntriesMutation(mut);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const genNewAccount = async (app, id) => {
  try {
    const encKeyPair = await netFns.genEncKeyPair(app);
    const inboxMd = await createInbox(app, encKeyPair.publicKey);
    const archiveMd = await createArchive(app);
    return {
      id,
      inboxMd,
      archiveMd,
      encSk: encKeyPair.privateKey,
      encPk: encKeyPair.publicKey
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const registerEmailService = async (app, serviceToRegister) => {
  try {
    const newAccount = await genNewAccount(app, serviceToRegister.emailId);
    const inboxSerialised = await newAccount.inboxMd.serialise();
    const md = await app.mutableData.newPublic(serviceToRegister.servicesXorName, CONSTANTS.TAG_TYPE_DNS);
    const mut = await app.mutableData.newMutation();
    await mut.insert(serviceToRegister.serviceName, inboxSerialised);
    await md.applyEntriesMutation(mut);
    return newAccount;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/*
* When a new email ID is created, in the case where a public ID already
* exists for it, a new service is simply created.
*
* In the case that the public ID for the service does exist, however,/
* was created by a foreign app, a request will be made to share that/
* public ID, which is simply a public Mutable Data structure, with this app
*
*/
export const createEmailService = async (app, servicesXorName, serviceInfo) => {
  const emailService = {
    servicesXorName,
    emailId: serviceInfo.emailId,
    serviceName: serviceInfo.serviceName
  };

  try {
    const newAccount = await registerEmailService(app, emailService);
    return { newAccount };
  } catch (err) {
    if (err.code === SAFE_APP_ERROR_CODES.ENTRY_ALREADY_EXISTS) {
      console.error(err);
      throw err;
    }
    await netFns.requestShareMdAuth(
      app,
      [{ type_tag: CONSTANTS.TAG_TYPE_DNS, name: servicesXorName, perms: ['Insert'] }]
    );
    return emailService;
  }
};

/*
* Overarching starting point to create a new account. With two cases:/
* Either a public ID for the requested email ID already exists/
* or it needs to be created
*/
export const setupAccount = async (app, emailId) => {
  const serviceInfo = await genServiceInfo(app, emailId);
  const pubNamesMd = await app.auth.getContainer(netFns.APP_INFO.containers.publicNames);
  try { // If service container already exists, try to add email service
    const encryptedAddr = await pubNamesMd.encryptKey(serviceInfo.publicId).then((key) => pubNamesMd.get(key));
    const servicesXorName = await pubNamesMd.decrypt(encryptedAddr.buf);
    return createEmailService(app, servicesXorName, serviceInfo);
  } catch (err) { // ...if not then create it
    if (err.code !== SAFE_APP_ERROR_CODES.ERR_NO_SUCH_ENTRY) {
      console.error(err);
      throw err;
    } else if (err.code === SAFE_APP_ERROR_CODES.ENTRY_ALREADY_EXISTS) {
      console.error(err);
      throw err;
    }
    try {
      // The public ID doesn't exist in _publicNames
      const newAccount = await genNewAccount(app, serviceInfo.emailId);
      const inboxSerialised = await newAccount.inboxMd.serialise();
      await createPublicIdAndEmailService(app, pubNamesMd, serviceInfo, inboxSerialised);
      return { newAccount };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
};

/*
* Once authorisation to share an MD with this app has been approved/
* email service is inserted into public ID MD.
*/
export const connectWithSharedMd = async (app, uri, serviceToRegister) => {
  try {
    await app.auth.loginFromURI(uri);
    await app.auth.refreshContainersPermissions();
    return registerEmailService(app, serviceToRegister);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const writeEmailContent = async (app, email, pk) => {
  try {
    const encryptedEmail = await netFns.encrypt(app, JSON.stringify(email), pk);
    const emailWriter = await app.immutableData.create();
    await emailWriter.write(encryptedEmail);
    const cipherOpt = await app.cipherOpt.newPlainText();
    return emailWriter.close(cipherOpt);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/*
* Sends an email to a recipient
*/
export const storeEmail = async (app, email, to) => {
  try {
    const serviceInfo = await genServiceInfo(app, to);
    const md = await app.mutableData.newPublic(serviceInfo.serviceAddr, CONSTANTS.TAG_TYPE_DNS);
    const service = await md.get(serviceInfo.serviceName);
    const inboxMd = await app.mutableData.fromSerial(service.buf);
    const pk = await inboxMd.get(CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY);
    const emailAddr = await writeEmailContent(app, email, pk.buf.toString());
    const mut = await app.mutableData.newMutation();
    const entryKey = genRandomEntryKey();
    const entryValue = await netFns.encrypt(app, emailAddr, pk.buf.toString());
    await mut.insert(entryKey, entryValue);
    return inboxMd.applyEntriesMutation(mut);
  } catch (err) {
    console.error(err);
    throw MESSAGES.EMAIL_ID_NOT_FOUND;
  }
};

export const removeEmail = async (app, container, key) => {
  try {
    const mut = await app.mutableData.newMutation();
    await mut.remove(key, 1);
    return container.applyEntriesMutation(mut);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/*
* Inserts email in archive MD
*/
export const archiveEmail = async (app, account, key) => {
  try {
    const newEntryKey = genRandomEntryKey();
    const xorName = await account.inboxMd.get(key);
    let mut = await app.mutableData.newMutation();
    await mut.insert(newEntryKey, xorName.buf);
    await account.archiveMd.applyEntriesMutation(mut);
    mut = await app.mutableData.newMutation();
    await mut.remove(key, 1);
    return account.inboxMd.applyEntriesMutation(mut);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const genServiceInfo = async (app, emailId) => {
  try {
    const serviceInfo = splitPublicIdAndService(emailId);
    const hashed = await app.crypto.sha3Hash(serviceInfo.publicId);
    serviceInfo.serviceAddr = hashed;
    return serviceInfo;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getLogFilePath = (app) => {
  if (!app) {
    return Promise.reject(new Error('Application not initialised'));
  }
  return app.logPath();
};
