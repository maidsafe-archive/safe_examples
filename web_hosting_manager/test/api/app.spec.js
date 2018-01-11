import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const should = chai.should();
const {expect, assert} = chai;

import * as h from './helpers';
import { initTempFolder } from '../../app/safenet_comm/temp';
import CONSTANTS from '../../app/constants';

describe('Smoke test', () => {
  let api = undefined;
  before(() => {
    api = h.newSafeApi();
  });

  it('Mock authorisation with Authenticator', async () => {
    await expect(api.authoriseMock()).to.be.ok
  });
});

describe('Create PublicName API', () => {
  let api = undefined;
  const publicName = h.randomStr();
  before(async () => {
    api = await h.authoriseApp();
  });

  it('throws error if publicName is empty', () => {
    return expect(api.createPublicName())
      .to.eventually.be.rejectedWith('Invalid publicName');
  });

  it(`create with name \'${publicName}\'`, async () => {
    await api.createPublicName(publicName);
    const hashPublicName = await api.sha3Hash(publicName);
    return expect(Promise.resolve(h.fetchPublicName(api, publicName))).to.eventually.eql(hashPublicName);
  });

  it(`fail to create duplicate public name (name - \'${publicName}\')`, async () => {
    return expect(api.createPublicName(publicName))
      .to.eventually.be.rejectedWith('Data given already exists');
  });
});

describe('Fetch PublicNames API', () => {
  let api = undefined;
  const publicName1 = h.randomStr();
  const publicName2 = h.randomStr();
  before(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName1);
    await api.createPublicName(publicName2);
  });

  it(`fetch PublicNames list with \'${publicName1}\' and \'${publicName2}\'`, async () => {
    const expected = [
      { name: publicName1 },
      { name: publicName2 }
    ];
    const actual = await api.fetchPublicNames();
    const expectedSorted = expected.map(i => i.name).sort;
    const actualSorted = actual.map(i => i.name).sort;
    await expect(Promise.resolve(actual)).to.eventually.be.ok.and.have.lengthOf(2);
    await expect(actualSorted).to.eql(expectedSorted);
  });
});

describe('Create Service Mutable Data API', () => {
  let api = undefined;
  const metaFor = h.randomStr();
  const servicePath = `_public/${metaFor}`
  before(async () => {
    api = await h.authoriseApp();
  });

  it('throws error if servicePath is empty', async () => {
    return expect(api.createServiceFolder())
      .to.eventually.be.rejectedWith('Invalid service path');
  });

  it('throws error if serice metadata is empty', async () => {
    return expect(api.createServiceFolder(servicePath))
      .to.eventually.be.rejectedWith('Invalid service metadata');
  });

  it('create new service MD', async () => {
    return expect(Promise.resolve(api.createServiceFolder(servicePath, metaFor))).to.eventually.be.ok
      .and.have.lengthOf(32);
  });

  it('fail to create duplicate service MD', async () => {
    return expect(api.createServiceFolder(servicePath, metaFor))
      .to.eventually.be.rejectedWith('EntryExists');
  });
});

describe('Create Service API', () => {
  let api = undefined;
  const publicName = h.randomStr();
  const serviceName = h.randomStr();
  const servicePath = `_public/${serviceName}`;
  let serviceXORName = undefined;
  before(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
    serviceXORName = await api.createServiceFolder(servicePath, serviceName);
  });

  it('throws error if publicName is empty', async () => {
    return expect(api.createService())
      .to.eventually.be.rejectedWith('Invalid publicName');
  });

  it('throws error if serviceName is empty', async () => {
    return expect(api.createService(publicName))
      .to.eventually.be.rejectedWith('Invalid serviceName');
  });

  it('throws error if service path is empty', async () => {
    return expect(api.createService(publicName, serviceName))
      .to.eventually.be.rejectedWith('Invalid service path');
  });

  it('create new service', async () => {
    await expect(api.createService(publicName, serviceName, serviceXORName)).to.be.ok;
  });

  it('fails to create duplicate service', async () => {
    return expect(api.createService(publicName, serviceName, serviceXORName))
      .to.eventually.rejectedWith('Entry value is not empty');
  });

  it('create new service with already mapped service folder', async () => {
    const serviceName2 = h.randomStr();
    await expect(api.createService(publicName, serviceName2, serviceXORName)).to.be.ok;
  });
});

describe('Fetch Services API', () => {
  let api = undefined;
  const publicName = h.randomStr();
  const serviceName = h.randomStr();
  const servicePath = `_public/${serviceName}`;
  let serviceXORName = undefined;
  before(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
    serviceXORName = await api.createServiceFolder(servicePath, serviceName);
    await api.createService(publicName, serviceName, serviceXORName);
    await api.fetchPublicNames();
  });

  it('fetch services for all publicName', async() => {
    const expected = [
      {
        name: publicName,
        services: [
          {
            name: serviceName,
            path: servicePath
          }
        ]
      }
    ];
    await expect(Promise.resolve(api.fetchServices())).to.eventually.have.lengthOf(1)
      .and.eql(expected);
  });
});

describe('Delete Service API', () => {
  let api = undefined;
  const publicName = h.randomStr();
  const serviceName = h.randomStr();
  const servicePath = `_public/${serviceName}`;
  let serviceXORName = undefined;
  before(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
    serviceXORName = await api.createServiceFolder(servicePath, serviceName);
    await api.createService(publicName, serviceName, serviceXORName);
    await api.fetchPublicNames();
    await api.fetchServices();
  });

  it('throws error if publicName is empty', async () => {
    return expect(api.deleteService())
      .to.eventually.be.rejectedWith('Invalid publicName');
  });

  it('throws error if serviceName is empty', async () => {
    return expect(api.deleteService(publicName))
      .to.eventually.be.rejectedWith('Invalid serviceName');
  });

  it('deletes the service', async () => {
    const expected = [
      {
        name: publicName,
        services: []
      }
    ];
    await expect(api.deleteService(publicName, serviceName)).to.be.ok;
    // await safeApi.fetchServices();
    await expect(Promise.resolve(api.fetchServices())).to.eventually.eql(expected)
      .and.have.lengthOf(1);
  });
});

describe('Remap Service', () => {
  let api = undefined;
  const publicName = h.randomStr();
  const serviceName = h.randomStr();
  const servicePath = `_public/${serviceName}`;
  const servicePath2 = `_public/${serviceName}2`;
  let serviceXORName = undefined;
  let serviceXORName2 = undefined;
  before(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
    serviceXORName = await api.createServiceFolder(servicePath, serviceName);
    serviceXORName2 = await api.createServiceFolder(servicePath2, `${serviceName}2`);
    await api.createService(publicName, serviceName, serviceXORName);
    await api.fetchPublicNames();
    await api.fetchServices();
  });

  it('throws error if publicName is empty', async () => {
    return expect(api.remapService())
      .to.eventually.be.rejectedWith('Invalid publicName');
  });

  it('throws error if serviceName is empty', async () => {
    return expect(api.remapService(publicName))
      .to.eventually.be.rejectedWith('Invalid serviceName');
  });

  it('throws error if service path is empty', async () => {
    return expect(api.remapService(publicName, serviceName))
      .to.eventually.be.rejectedWith('Invalid service path');
  });

  it('remap to another service folder', async () => {
    const expectedBefore = [
      {
        name: publicName,
        services: [
          {
            name: serviceName,
            path: servicePath
          }
        ]
      }
    ];
    const expectedAfter = [
      {
        name: publicName,
        services: [
          {
            name: serviceName,
            path: servicePath2
          }
        ]
      }
    ];
    await expect(Promise.resolve(api.fetchServices())).to.eventually.eql(expectedBefore);
    await expect(api.remapService(publicName, serviceName, servicePath2)).to.be.ok;
    await api.fetchServices();
    await expect(Promise.resolve(api.fetchServices())).to.eventually.eql(expectedAfter);
  });
});

describe('Can Access Service Container API', () => {
  let api = undefined;
  const publicName = h.randomStr();
  before(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
  });

  it('throws error if publicName is empty', async () => {
    return expect(Promise.resolve(api.canAccessServiceContainer()))
      .to.eventually.be.rejectedWith('Invalid publicName');
  });

  it('can access publicName created by own', async () => {
    expect(api.canAccessServiceContainer(publicName)).to.be.ok;
  });

  it('can\'t access publicName created by other user', async () => {
    const api2 = await h.authoriseApp();
    const publicName2 = h.randomStr();
    await api2.createPublicName(publicName2);
    await expect(Promise.resolve(api.canAccessServiceContainer(publicName2)))
      .to.eventually.be.rejectedWith('Requested entry not found');
  });
});

describe('Get Service Folder Names API', () => {
  let api = undefined;
  const publicName = h.randomStr();
  const serviceName = h.randomStr();
  const serviceName2 = h.randomStr();
  const servicePath = `_public/${serviceName}`;
  const servicePath2 = `_public/${serviceName2}`;
  let serviceXORName = undefined;
  let serviceXORName2 = undefined;
  before(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
    serviceXORName = await api.createServiceFolder(servicePath, serviceName);
    serviceXORName2 = await api.createServiceFolder(servicePath2, serviceName2);
    await api.createService(publicName, serviceName, serviceXORName);
    await api.createService(publicName, serviceName2, serviceXORName2);
    await api.fetchPublicNames();
  });

  it('fetch path names', async () => {
    const expected = [
      servicePath,
      servicePath2
    ];
    const actual = await api.getServiceFolderNames();
    const expectedSorted = expected.map(i => i).sort;
    const actualSorted = actual.map(i => i).sort;
    await expect(Promise.resolve(actual)).to.eventually.have.lengthOf(2);
    await expect(actualSorted).to.eql(expectedSorted);
  });
});

describe('Get Service Folder Info', () => {
  let api = undefined;
  const publicName = h.randomStr();
  const serviceName = h.randomStr();
  const servicePath = `_public/${serviceName}`;
  let serviceXORName = undefined;
  before(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
    serviceXORName = await api.createServiceFolder(servicePath, serviceName);
    await api.createService(publicName, serviceName, serviceXORName);
    await api.fetchPublicNames();
  });

  it('throws error if service path is empty', async () => {
    return expect(api.getServiceFolderInfo())
      .to.eventually.be.rejectedWith('Invalid service path');
  });

  it('fetch info', async () => {
    const info = await api.getServiceFolderInfo(servicePath);
    await expect(Promise.resolve(info.name)).to.eventually.have.lengthOf(32);
    await expect(Promise.resolve(info.name)).to.eventually.eql(serviceXORName);
    await expect(Promise.resolve(info.type_tag)).to.eventually.eql(CONSTANTS.TYPE_TAG.WWW);
  });
});

describe('Upload File API', () => {
  let api = undefined;
  const publicName = h.randomStr();
  const serviceName = h.randomStr();
  const servicePath = `_public/root-${publicName}/${serviceName}`;
  let serviceXORName = undefined;
  before(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
    serviceXORName = await api.createServiceFolder(servicePath, serviceName);
    await api.createService(publicName, serviceName, serviceXORName);
    await api.fetchPublicNames();
    await api.fetchServices();
  });

  it('upload directory', async () => {
    await expect(new Promise((resolve, reject) => {
      const localPath = __dirname;
      const networkPath = servicePath;
      const progressCb = (status, isCompleted) => {
        expect(status).to.have.property('total');
        expect(status.total).to.have.property('size');
        expect(status.total).to.have.property('files');
        expect(status.total).to.have.property('directories');
        expect(status).to.have.property('completed');
        expect(status.completed).to.have.property('size');
        expect(status.completed).to.have.property('files');
        expect(status.completed).to.have.property('directories');
        expect(status).to.have.property('progress');
        if (isCompleted) {
          expect(status.progress).to.be.equal(100);
          resolve(true);
        }     
      };

      const errorCb = (error) => {
        reject(error);
      };
      api.fileUpload(localPath, networkPath, progressCb, errorCb);
    })).to.be.ok;
  });
});

describe('Download File API', () => {
  let api = undefined;
  const publicName = h.randomStr();
  const serviceName = h.randomStr();
  const servicePath = `_public/root-${publicName}/${serviceName}`;
  let serviceXORName = undefined;
  const localPath = path.resolve(__dirname, 'sample.txt');
  const networkPath = servicePath;
  before(async () => {
    initTempFolder();
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
    serviceXORName = await api.createServiceFolder(servicePath, serviceName);
    await api.createService(publicName, serviceName, serviceXORName);
    await api.fetchPublicNames();
    await api.fetchServices();
    await (new Promise((resolve, reject) => {
      const progressCb = (status, isCompleted) => {
        if (isCompleted) {
          resolve(true);
        }
      };

      const errorCb = (error) => {
        reject(error);
      };
      api.fileUpload(localPath, networkPath, progressCb, errorCb);
    }));
  });

  it('download file', async () => {
    await expect(new Promise((resolve, reject) => {
      const cb = (err, status) => {
        if (err) {
          return reject(err);
        }
        expect(status).to.have.property('completed');
        expect(status).to.have.property('progress');
        if (status.completed) {
          expect(status.progress).to.equal(100);
          resolve(true);
        }
      };
      const nwPath = `${networkPath}/sample.txt`;
      api.fileDownload(nwPath, cb);
    })).to.be.ok;
  });
});
