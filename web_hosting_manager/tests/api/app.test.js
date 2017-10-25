import path from 'path';

import * as h from './helpers';
import { initTempFolder } from '../../src/lib/temp';
import CONSTANTS from '../../src/constants';

expect.extend({
  isXORName(received) {
    if (received.length === 32) {
      return {
        message: () => (
          `expected ${received} not to be an ArrayType`
        ),
        pass: true,
      };
    }
    return {
      message: () => (
        `expected ${received} not to be an ArrayType`
      ),
      pass: false,
    };
  },
  arrayCounts(received, argument) {
    if (received.length === argument) {
      return {
        message: () => (
          `expected ${received} length not to be equal to ${argument}`
        ),
        pass: true,
      };
    }
    return {
      message: () => (
        `expected ${received} length not to be equal to ${argument}`
      ),
      pass: false,
    };
  },
});

describe('Smoke test', () => {
  let api = undefined;
  beforeAll(() => {
    api = h.newSafeApi();
  });

  it('Mock authorisation with Authenticator', async () => (
    await expect(api.authoriseMock()).resolves
  ));
});

describe('Create PublicName API', () => {
  let api = undefined;
  const publicName = h.randomStr();
  beforeAll(async () => {
    api = await h.authoriseApp();
  });

  it('throws error if publicName is empty', async () => (
    await expect(api.createPublicName())
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.APP_ERR_CODE.INVALID_PUBLIC_NAME)
  ));

  it(`create with name \'${publicName}\'`, async () => {
    await expect(api.createPublicName(publicName)).resolves.toBeTruthy();
    const hashPublicName = await h.sha3Hash(api, publicName);
    await expect(h.fetchPublicName(api, publicName)).resolves.toMatchObject(hashPublicName);
  });

  it(`fail to crate create dubpicate public name (name - \'${publicName}\')`, async () => {
    await expect(api.createPublicName(publicName))
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.ERROR_CODE.DATA_EXISTS);
  });
});

describe('Fetch PublicNames API', () => {
  let api = undefined;
  const publicName1 = h.randomStr();
  const publicName2 = h.randomStr();
  beforeAll(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName1);
    await api.createPublicName(publicName2);
  });

  it(`fetch PublicNames list with \'${publicName1}\' and \'${publicName2}\'`, async () => {
    const expected = [
      { name: publicName1 },
      { name: publicName2 }
    ];
    await expect(api.fetchPublicNames()).resolves.toEqual(expect.arrayContaining(expected));
    await expect(api.fetchPublicNames()).resolves.arrayCounts(2);
  });
});

describe('Create Service Mutable Data API', () => {
  let api = undefined;
  const metaFor = h.randomStr();
  const servicePath = `_public/${metaFor}`
  beforeAll(async () => {
    api = await h.authoriseApp();
  });

  it('throws error if servicePath is empty', async () => (
    await expect(api.createServiceFolder())
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_PATH)
  ));

  it('throws error if serice metadata is empty', async () => (
    await expect(api.createServiceFolder(servicePath))
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_META)
  ));

  it('create new service MD', async () => (
    await expect(api.createServiceFolder(servicePath, metaFor)).resolves.isXORName()
  ));

  it('fail to create duplicate service MD', async () => (
    await expect(api.createServiceFolder(servicePath, metaFor))
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.ERROR_CODE.ENTRY_EXISTS)
  ));
});

describe('Create Service API', () => {
  let api = undefined;
  const publicName = h.randomStr();
  const serviceName = h.randomStr();
  const servicePath = `_public/${serviceName}`;
  let serviceXORName = undefined;
  beforeAll(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
    serviceXORName = await api.createServiceFolder(servicePath, serviceName);
  });

  it('throws error if publicName is empty', async () => (
    await expect(api.createService())
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.APP_ERR_CODE.INVALID_PUBLIC_NAME)
  ));

  it('throws error if serviceName is empty', async () => (
    await expect(api.createService(publicName))
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_NAME)
  ));

  it('throws error if service path is empty', async () => (
    await expect(api.createService(publicName, serviceName))
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_PATH)
  ));

  it('create new service', async () => {
    await expect(api.createService(publicName, serviceName, serviceXORName)).resolves.toBeTruthy();
    await expect(h.fetchServiceName(api, publicName, serviceName)).resolves.toMatchObject(serviceXORName.buffer);
  });

  it('fail to create duplicate service', async () => (
    await expect(api.createService(publicName, serviceName, serviceXORName))
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.APP_ERR_CODE.ENTRY_VALUE_NOT_EMPTY)
  ));

  it('create new service with already mapped service folder', async () => {
    const serviceName2 = h.randomStr();
    await expect(api.createService(publicName, serviceName2, serviceXORName)).resolves.toBeTruthy();
  });

  // it('create new service with service folder mapped to service of another publicName')
});

describe('Fetch Services API', () => {
  let api = undefined;
  const publicName = h.randomStr();
  const serviceName = h.randomStr();
  const servicePath = `_public/${serviceName}`;
  let serviceXORName = undefined;
  beforeAll(async () => {
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
    await expect(api.fetchServices()).resolves.toEqual(expect.arrayContaining(expected));
    await expect(api.fetchServices()).resolves.arrayCounts(1);
  });
});

describe('Delete Service API', () => {
  let api = undefined;
  const publicName = h.randomStr();
  const serviceName = h.randomStr();
  const servicePath = `_public/${serviceName}`;
  let serviceXORName = undefined;
  beforeAll(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
    serviceXORName = await api.createServiceFolder(servicePath, serviceName);
    await api.createService(publicName, serviceName, serviceXORName);
    await api.fetchPublicNames();
    await api.fetchServices();
  });

  it('throws error if publicName is empty', async () => (
    await expect(api.deleteService())
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.APP_ERR_CODE.INVALID_PUBLIC_NAME)
  ));

  it('throws error if serviceName is empty', async () => (
    await expect(api.deleteService(publicName))
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_NAME)
  ));

  it('delets the service', async () => {
    const expected = [
      {
        name: publicName,
        services: []
      }
    ];
    await expect(api.deleteService(publicName, serviceName)).resolves.toBeTruthy();
    await expect(api.fetchServices()).resolves.toEqual(expect.arrayContaining(expected));
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
  beforeAll(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
    serviceXORName = await api.createServiceFolder(servicePath, serviceName);
    serviceXORName2 = await api.createServiceFolder(servicePath2, `${serviceName}2`);
    await api.createService(publicName, serviceName, serviceXORName);
    await api.fetchPublicNames();
    await api.fetchServices();
  });

  it('throws error if publicName is empty', async () => (
    await expect(api.remapService())
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.APP_ERR_CODE.INVALID_PUBLIC_NAME)
  ));

  it('throws error if serviceName is empty', async () => (
    await expect(api.remapService(publicName))
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_NAME)
  ));

  it('throws error if service path is empty', async () => (
    await expect(api.remapService(publicName, serviceName))
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_PATH)
  ));

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
    await expect(api.fetchServices()).resolves.toEqual(expect.arrayContaining(expectedBefore));
    await expect(api.remapService(publicName, serviceName, servicePath2)).resolves.toBeTruthy();
    await expect(api.fetchServices()).resolves.toEqual(expect.arrayContaining(expectedAfter));
  });
});

describe('Can Access Service Container API', () => {
  let api = undefined;
  const publicName = h.randomStr();
  beforeAll(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
  });

  it('throws error if publicName is empty', async () => (
    await expect(api.canAccessServiceContainer())
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.APP_ERR_CODE.INVALID_PUBLIC_NAME)
  ));

  it('can access publicName created by own', async () => {
    await expect(api.canAccessServiceContainer(publicName)).resolves.toBeTruthy();
  });

  it('can\'t access publicName created by other user', async () => {
    const api2 = await h.authoriseApp();
    const publicName2 = h.randomStr();
    await api2.createPublicName(publicName2);

    await expect(api.canAccessServiceContainer(publicName2))
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.ERROR_CODE.NO_SUCH_ENTRY);
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
  beforeAll(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
    serviceXORName = await api.createServiceFolder(servicePath, serviceName);
    serviceXORName2 = await api.createServiceFolder(servicePath2, serviceName2);
    await api.createService(publicName, serviceName, serviceXORName);
    await api.createService(publicName, serviceName2, serviceXORName2);
    await api.fetchPublicNames();
  });

  it('fetch path names', async () => {
    const expected = [];
    expected.push(servicePath);
    expected.push(servicePath2);
    await expect(api.getServiceFolderNames()).resolves.toEqual(expect.arrayContaining(expected))
    await expect(api.getServiceFolderNames()).resolves.arrayCounts(2);
  });
});

describe('Get Service Folder Info', () => {
  let api = undefined;
  const publicName = h.randomStr();
  const serviceName = h.randomStr();
  const servicePath = `_public/${serviceName}`;
  let serviceXORName = undefined;
  beforeAll(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
    serviceXORName = await api.createServiceFolder(servicePath, serviceName);
    await api.createService(publicName, serviceName, serviceXORName);
    await api.fetchPublicNames();
  });

  it('throws error if service path is empty', async () => (
    await expect(api.getServiceFolderInfo())
      .rejects
      .toHaveProperty(h.errorCodeKey, CONSTANTS.APP_ERR_CODE.INVALID_SERVICE_PATH)
  ));

  it('fetch info', async () => {
    const info = await api.getServiceFolderInfo(servicePath);
    expect(info.name).isXORName();
    expect(info.name).toEqual(serviceXORName);
    expect(info.tag).toEqual(CONSTANTS.TYPE_TAG.WWW);
  });
});

describe('Upload File API', () => {
  let api = undefined;
  const publicName = h.randomStr();
  const serviceName = h.randomStr();
  const servicePath = `_public/root-${publicName}/${serviceName}`;
  let serviceXORName = undefined;
  beforeAll(async () => {
    api = await h.authoriseApp();
    await api.createPublicName(publicName);
    serviceXORName = await api.createServiceFolder(servicePath, serviceName);
    await api.createService(publicName, serviceName, serviceXORName);
    await api.fetchPublicNames();
    await api.fetchServices();
  });

  it('upload dir', async () => {
    await expect(new Promise((resolve, reject) => {
      const localPath = __dirname;
      const networkPath = servicePath;
      const progressCb = (status, isCompleted) => {
        expect(status).toHaveProperty('total');
        expect(status.total).toHaveProperty('size');
        expect(status.total).toHaveProperty('files');
        expect(status.total).toHaveProperty('directories');
        expect(status).toHaveProperty('completed');
        expect(status.completed).toHaveProperty('size');
        expect(status.completed).toHaveProperty('files');
        expect(status.completed).toHaveProperty('directories');
        expect(status).toHaveProperty('progress');
        if (isCompleted) {
          expect(status.progress).toEqual(100);
          resolve(true);
        }
      };

      const errorCb = (error) => {
        reject(error);
      };
      api.fileUpload(localPath, networkPath, progressCb, errorCb);
    })).resolves.toBeTruthy();
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
  beforeAll(async () => {
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
        expect(status).toHaveProperty('completed');
        expect(status).toHaveProperty('progress');
        if (status.completed) {
          expect(status.progress).toEqual(100);
          resolve(true);
        }
      };
      const nwPath = `${networkPath}/sample.txt`;
      api.fileDownload(nwPath, cb);
    })).resolves.toBeTruthy();
  });
});
