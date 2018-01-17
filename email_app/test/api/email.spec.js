import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import * as api from '../../app/safenet_comm/index.js';
import * as h from './helpers.js';

chai.use(chaiAsPromised);
const { expect } = chai;

// describe('Get Log File Path', () => {
//   let app;
//   before(async () => {
//     app = await api.authoriseMock();
//   });
//   it('log file path', async () => {
//     await expect(Promise.resolve(api.getLogFilePath(app))).to.eventually.be.ok;
//   });
// });

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
  // it('fetch public id', async () => {
  //   await expect(Promise.resolve(api.fetchPublicIds(app)))
  //     .to.eventually.be.ok
  //     .and.have.lengthOf(1);
  // });
  // it('test public id has all the keys and properties', async () => {
  //   const arr = await api.fetchPublicIds(app);
  //   await expect(arr[0]).to.have.all.keys('id', 'service');
  //   await expect(arr[0]).to.have.property('id', emailId.split('.').pop());
  // });
  // it('fetch email id', async () => {
  //   const expected = [
  //     emailId
  //   ];
  //   await expect(Promise.resolve(api.fetchEmailIds(app)))
  //     .to.eventually.be.ok
  //     .and.eql(expected)
  //     .and.have.lengthOf(1);
  // });
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

// describe('Create Archive', () => {
//   let app;
//   before(async () => {
//     app = await api.authoriseMock();
//   });
//   it('create archive', async () => {
//     await expect(Promise.resolve(api.createArchive(app))).to.eventually.be.ok;
//   });
// });

// describe('Register Email Service', () => {
//   let app;
//   before(async () => {
//     app = await api.authoriseMock();
//   });
  // it('register email service', async () => {
  //   const emailId = 'tech.info';
  //   const serviceInfo = await api.genServiceInfo(app, emailId);
  //   const pubNamesMd = await app.auth.getContainer('_publicNames');
  //   const key = await pubNamesMd.encryptKey(serviceInfo.publicId);
  //   const servicesXorName = await pubNamesMd.decrypt(key);
  //   const serviceToRegister = {
  //     servicesXorName,
  //     serviceName: serviceInfo.serviceName,
  //   };
  //   await expect(Promise.resolve(api.registerEmailService(app, serviceToRegister))).to.eventually.be.ok;
  // });
// });

// describe('Email', () => {
//   let app;
//   let key1;
//   let pubNamesMd;
//   const emailId = h.randomStr();
//   const email = 'hello world, thank you';
//   before(async () => {
//     app = await api.authoriseMock();
//     key1 = await h.genRandomEntryKey();
//     const serviceInfo = await api.genServiceInfo(app, emailId);
//     pubNamesMd = await app.auth.getContainer(api.APP_INFO.containers.publicNames);
//     const newAccount = await api.genNewAccount(app, serviceInfo.emailId);
//     const inboxSerialised = await newAccount.inboxMd.serialise();
//     await api.createPublicIdAndEmailService(app, pubNamesMd, serviceInfo, inboxSerialised);
//   });
//   it('write email content', async () => {
//     await expect(Promise.resolve(api.writeEmailContent(app, email, key1))).to.eventually.be.ok;
//   });
//   // it('remove an email', async () => {
//   //   const rawEntries = [];
//   //   const container = pubNamesMd;
//   //   const entries = await container.getEntries();
//   //   await entries.forEach((key, value) => {
//   //     rawEntries.push({ key, value });
//   //   });
//   //   const key = rawEntries[0].key;
//   //   await expect(Promise.resolve(api.removeEmail(app, container, key))).to.eventually.be.ok;
//   // });
//   //   it('archive email', async () => {
//   //     const encKeyPair = await api.genEncKeyPair(app);
//   //     const inboxMD = await api.createInbox(app, encKeyPair.publicKey);
//   //     const archiveMD = await api.createArchive(app);
//   //     const account = {
//   //       inboxMd: inboxMD,
//   //       archiveMd: archiveMD
//   //     };
//   //     await expect(Promise.resolve(api.archiveEmail(app, account, key1))).to.eventually.be.ok;
//   //   });
//   //   it('send email to given email id', async () => {
//   //     const to = emailId;
//   //     await expect(Promise.resolve(api.storeEmail(app, email, to))).to.eventually.be.ok;
//   //   });
// });

// describe('Store email', () => {
//   let app;
//   const emailId = h.randomStr();
//   before(async () => {
//     app = await api.authoriseMock();
//     const serviceInfo = await api.genServiceInfo(app, emailId);
//     const pubNamesMd = await app.auth.getContainer(api.APP_INFO.containers.publicNames);
//     const newAccount = await api.genNewAccount(app, serviceInfo.emailId);
//     const inboxSerialised = await newAccount.inboxMd.serialise();
//     await api.createPublicIdAndEmailService(app, pubNamesMd, serviceInfo, inboxSerialised);
//   });
//   it('send email to given email id', async () => {
//     const email = 'hello world, thank you';
//     const to = emailId;
//     await expect(Promise.resolve(api.storeEmail(app, email, to))).to.eventually.be.ok;
//   });
// });

// // describe('Remove email', () => {
// //   let app;
// //   before(async () => {
// //     app = await api.authoriseMock();
// //   });
// //   it('Remove an email', async () => {
// //     const container = await app.auth.getContainer('_publicNames');
// //     // const email = 'hello world, thank you';
// //     // const to = 'hello.info';
// //     const key = await h.genRandomEntryKey();
// //     // await h.storeEmail(app, email, to, key);
// //     console.log(key);
// //     await expect(Promise.resolve(api.removeEmail(app, container, key))).to.eventually.be.ok;
// //   });
// // });

// describe('Read inboxed email', () => {
//   let app;
//   before(async () => {
//     app = await api.authoriseMock();
//   });
//   it('read an email from inbox', async () => {
//     const encKeyPair = await api.genEncKeyPair(app);
//     const inboxMd = await api.createInbox(app, encKeyPair.publicKey);
//     const account = {
//       id: 'hello.info',
//       encSk: encKeyPair.privateKey,
//       encPk: encKeyPair.publicKey,
//       inboxMd
//     };
//     await expect(Promise.resolve(api.readInboxEmails(app, account))).to.eventually.be.ok;
//   });
// });

// // describe('Read archived email', () => {
// //   let app;
// //   const emailId = h.randomStr();
// //   before(async () => {
// //     app = await api.authoriseMock();
// //   });
// //   it('read an email from archive', async () => {
// //     const serviceInfo = await api.genServiceInfo(app, emailId);
// //     const pubNamesMd = await app.auth.getContainer(api.APP_INFO.containers.publicNames);
// //     const newAccount = await api.genNewAccount(app, serviceInfo.emailId);
// //     const inboxSerialised = await newAccount.inboxMd.serialise();
// //     await api.createPublicIdAndEmailService(app, pubNamesMd, serviceInfo, inboxSerialised);
// //     // const id = await api.sha3Hash(app, emailId);
// //     const encKeyPair = await api.genEncKeyPair(app);
// //     const inboxMd = await api.createInbox(app, encKeyPair.publicKey);
// //     const archiveMd = await api.createArchive(app);
// //     const rawEntries = [];
// //     const container = pubNamesMd;
// //     const entries = await container.getEntries();
// //     await entries.forEach((key, value) => {
// //       rawEntries.push({ key, value });
// //     });
// //     const key = rawEntries[0].key;
// //     const account = {
// //       id: emailId,
// //       encSk: encKeyPair.privateKey,
// //       encPk: encKeyPair.publicKey,
// //       inboxMd,
// //       archiveMd
// //     };
// //     const email = 'hello world, thank you';
// //     await api.storeEmail(app, email, emailId);
// //     await api.archiveEmail(app, account, key);
// //     await expect(Promise.resolve(api.readArchivedEmails(app, account))).to.eventually.be.ok;
// //   });
// // });

// describe('Write Config', () => {
//   let app;
//   before(async () => {
//     app = await api.authoriseMock();
//   });
//   it('testing', async () => {
//     const encKeyPair = await api.genEncKeyPair(app);
//     const inboxMD = await api.createInbox(app, encKeyPair.publicKey);
//     const archiveMD = await api.createArchive(app);
//     const account = {
//       id: h.randomStr(),
//       encSk: encKeyPair.privateKey,
//       encPk: encKeyPair.publicKey,
//       inboxMd: inboxMD,
//       archiveMd: archiveMD
//     };
//     await expect(Promise.resolve(api.writeConfig(app, account))).to.eventually.be.ok;
//   });
// });

// describe('Read Config', () => {
//   let app;
//   before(async () => {
//     app = await api.authoriseMock();
//   });
//   it('testing', async () => {
//     const encKeyPair = await api.genEncKeyPair(app);
//     const inboxMD = await api.createInbox(app, encKeyPair.publicKey);
//     const archiveMD = await api.createArchive(app);
//     const account = {
//       id: h.randomStr(),
//       encSk: encKeyPair.privateKey,
//       encPk: encKeyPair.publicKey,
//       inboxMd: inboxMD,
//       archiveMd: archiveMD
//     };
//     await api.writeConfig(app, account);
//     await expect(Promise.resolve(api.readConfig(app, account.id))).to.eventually.be.ok;
//   });
// });

// describe('Create Inbox', () => {
//   let app;
//   before(async () => {
//     app = await api.authoriseMock();
//   });
//   it('testing', async () => {
//     const encKeyPair = await api.genEncKeyPair(app);
//     const encPk = encKeyPair.publicKey;
//     await expect(Promise.resolve(api.createInbox(app, encPk))).to.eventually.be.ok;
//   });
// });

// describe('Create an Email Service', () => {
//   let app;
//   before(async () => {
//     app = await api.authoriseMock();
//   });
//   it('create email service', async () => {
//     const emailId = 'tech.info';
//     const serviceInfo = await api.genServiceInfo(app, emailId);
//     const pubNamesMd = await app.auth.getContainer('_publicNames');
//     const key = await pubNamesMd.encryptKey(serviceInfo.publicId);
//     const servicesXorName = await pubNamesMd.decrypt(key);
//     await expect(api.createEmailService(app, servicesXorName, serviceInfo)).to.be.ok;
//   });
//   it('throws error if servicesXorName is missing', async () => {
//     await expect(api.createEmailService(app)).to.be.rejectedWith('Cannot read property');
//   });
// });

// describe('Create enc name', () => {
//   let app;
//   before(async () => {
//     app = await api.authoriseMock();
//   });
//   it('create enc name', async () => {
//     await expect(api.createPublicName(app, 'hello')).to.be.ok;
//   });
// });

// describe('Setup an Account', () => {
//   let app;
//   before(async () => {
//     app = await api.authoriseMock();
//   });
//   it('new account', async () => {
//     const emailId = 'hello.info';
//     await expect(Promise.resolve(api.setupAccount(app, emailId))).to.eventually.be.ok;
//   });
// });
