import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import * as api from '../../app/safenet_comm/index.js';
import * as h from './helpers.js';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Public ID', () => {
  let app;
  const emailId = h.randomStr();
  before(async () => {
    app = await api.authoriseMock();
  });
  it('create public id', async () => {
    const serviceInfo = await api.genServiceInfo(app, emailId);
    const pubNamesMd = await app.auth.getContainer(api.APP_INFO.containers.publicNames);
    const newAccount = await api.genNewAccount(app, serviceInfo.emailId);
    const inboxSerialised = await newAccount.inboxMd.serialise();
    await api.createPublicIdAndEmailService(app, pubNamesMd, serviceInfo, inboxSerialised);
  });
  it('fetch public id', async () => {
    await expect(Promise.resolve(api.fetchPublicIds(app)))
      .to.eventually.be.ok
      .and.have.lengthOf(1);
  });
  it('test public id has all the keys and properties', async () => {
    const arr = await api.fetchPublicIds(app);
    await expect(arr[0]).to.have.all.keys('id', 'service');
    await expect(arr[0]).to.have.property('id', emailId.split('.').pop());
  });
  it('fetch email id', async () => {
    const expected = [
      emailId
    ];
    await expect(Promise.resolve(api.fetchEmailIds(app)))
      .to.eventually.be.ok
      .and.eql(expected)
      .and.have.lengthOf(1);
  });
  it('fails to create a duplicate id', async () => {
    const serviceInfo = await api.genServiceInfo(app, emailId);
    const pubNamesMd = await app.auth.getContainer(api.APP_INFO.containers.publicNames);
    const newAccount = await api.genNewAccount(app, serviceInfo.emailId);
    const inboxSerialised = await newAccount.inboxMd.serialise();
    await expect(Promise.resolve(api.createPublicIdAndEmailService(app, pubNamesMd, serviceInfo, inboxSerialised)))
      .to.eventually.be.rejectedWith('Core error: Routing client error -> Data given already exists')
      .with.property('code', -104);
  });
});

describe('Setup an Account', () => {
  let app;
  const emailId = h.randomStr();
  before(async () => {
    app = await api.authoriseMock();
  });
  it('new account', async () => {
    await expect(Promise.resolve(api.setupAccount(app, emailId))).to.eventually.be.ok;
  });
  it('throws error if entry exists', async () => {
    await expect(Promise.resolve(api.setupAccount(app, emailId)))
      .to.eventually.be.rejectedWith('EntryExists');
  });
});

describe('Create Archive', () => {
  let app;
  before(async () => {
    app = await api.authoriseMock();
  });
  it('create archive', async () => {
    await expect(Promise.resolve(api.createArchive(app))).to.eventually.be.ok;
  });
});

describe('Email', () => {
  let app;
  let key;
  let pubNamesMd;
  const emailId = h.randomStr();
  const email = 'hello world, thank you';
  before(async () => {
    app = await api.authoriseMock();
    key = await h.genRandomEntryKey();
    const serviceInfo = await api.genServiceInfo(app, emailId);
    pubNamesMd = await app.auth.getContainer(api.APP_INFO.containers.publicNames);
    const newAccount = await api.genNewAccount(app, serviceInfo.emailId);
    const inboxSerialised = await newAccount.inboxMd.serialise();
    await api.createPublicIdAndEmailService(app, pubNamesMd, serviceInfo, inboxSerialised);
  });
  it('write email content', async () => {
    await expect(Promise.resolve(api.writeEmailContent(app, email, key))).to.eventually.be.ok;
  });
  it('send email to given email id', async () => {
    const to = emailId;
    await expect(Promise.resolve(api.storeEmail(app, email, to))).to.eventually.be.ok;
  });
  it('read an email from inbox', async () => {
    const encKeyPair = await api.genEncKeyPair(app);
    const inboxMd = await api.createInbox(app, encKeyPair.publicKey);
    const account = {
      inboxMd
    };
    await expect(Promise.resolve(api.readInboxEmails(app, account))).to.eventually.be.ok;
  });
});

describe('Remove email', () => {
  let app;
  const rawEntries = [];
  let inboxMd;
  before(async () => {
    app = await api.authoriseMock();
    const encKeyPair = await api.genEncKeyPair(app);
    inboxMd = await api.createInbox(app, encKeyPair.publicKey);
  });
  it('remove email', async () => {
    const entries = await inboxMd.getEntries();
    await entries.forEach((key, value) => {
      rawEntries.push({ key, value });
    });
    const key = rawEntries[0].key;
    await expect(Promise.resolve(api.removeEmail(app, inboxMd, key))).to.eventually.be.ok;
  });
});

describe('Create Inbox', () => {
  let app;
  before(async () => {
    app = await api.authoriseMock();
  });
  it('create inbox', async () => {
    const encKeyPair = await api.genEncKeyPair(app);
    const encPk = encKeyPair.publicKey;
    await expect(Promise.resolve(api.createInbox(app, encPk))).to.eventually.be.ok;
  });
});

describe('Archive email', () => {
  let app;
  const emailId = h.randomStr();
  const rawEntries = [];
  let inboxMd;
  let archiveMd;
  let entries;
  let account;
  before(async () => {
    app = await api.authoriseMock();
    const encKeyPair = await api.genEncKeyPair(app);
    inboxMd = await api.createInbox(app, encKeyPair.publicKey);
    archiveMd = await api.createArchive(app);
    entries = await inboxMd.getEntries();
    account = {
      id: emailId,
      encSk: encKeyPair.privateKey,
      encPk: encKeyPair.publicKey,
      inboxMd,
      archiveMd
    };
  });
  it('archive mail', async () => {
    await entries.forEach((key, value) => {
      rawEntries.push({ key, value });
    });
    const key = rawEntries[0].key;
    await expect(api.archiveEmail(app, account, key)).to.be.ok;
  });
  it('read an email from archive', async () => {
    await expect(api.readArchivedEmails(app, account)).to.be.ok;
  });
});

describe('Write Config', () => {
  let app;
  before(async () => {
    app = await api.authoriseMock();
  });
  it('write config', async () => {
    const encKeyPair = await api.genEncKeyPair(app);
    const inboxMD = await api.createInbox(app, encKeyPair.publicKey);
    const archiveMD = await api.createArchive(app);
    const account = {
      id: h.randomStr(),
      encSk: encKeyPair.privateKey,
      encPk: encKeyPair.publicKey,
      inboxMd: inboxMD,
      archiveMd: archiveMD
    };
    await expect(Promise.resolve(api.writeConfig(app, account))).to.eventually.be.ok;
  });
});

describe('Read Config', () => {
  let app;
  before(async () => {
    app = await api.authoriseMock();
  });
  it('read config', async () => {
    const encKeyPair = await api.genEncKeyPair(app);
    const inboxMD = await api.createInbox(app, encKeyPair.publicKey);
    const archiveMD = await api.createArchive(app);
    const account = {
      id: h.randomStr(),
      encSk: encKeyPair.privateKey,
      encPk: encKeyPair.publicKey,
      inboxMd: inboxMD,
      archiveMd: archiveMD
    };
    await api.writeConfig(app, account);
    await expect(Promise.resolve(api.readConfig(app, account.id))).to.eventually.be.ok;
  });
});

describe('Create an Email Service', () => {
  let app;
  const emailId = h.randomStr();
  let servicesXorName;
  let serviceInfo;
  before(async () => {
    app = await api.authoriseMock();
    serviceInfo = await api.genServiceInfo(app, emailId);
    const pubNamesMd = await app.auth.getContainer(api.APP_INFO.containers.publicNames);
    const key = await pubNamesMd.encryptKey(serviceInfo.publicId);
    servicesXorName = await pubNamesMd.decrypt(key);
  });
  it('create email service', async () => {
    await expect(api.createEmailService(app, servicesXorName, serviceInfo)).to.be.ok;
  });
  it('throws error if parameters are missing', async () => {
    await expect(api.createEmailService(app)).to.be.rejectedWith('Cannot read property');
  });
});

describe('Get Log File Path', () => {
  let app;
  before(async () => {
    app = await api.authoriseMock();
  });
  it('log file path', async () => {
    await expect(Promise.resolve(api.getLogFilePath(app))).to.eventually.be.ok;
  });
});
