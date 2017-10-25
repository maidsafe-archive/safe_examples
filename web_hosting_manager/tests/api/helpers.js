import crypto from 'crypto';
import { Api as SafeApi } from '../../src/lib/api';
import CONSTANTS from '../../src/constants';

export const errorCodeKey = '__proto__.code';

export const randomStr = () => crypto.randomBytes(10).toString('hex');

export const newSafeApi = () => (
  new SafeApi()
);

export const authoriseApp = () => {
  return new Promise(async (resolve) => {
    const api = newSafeApi();
    await api.authoriseMock();
    resolve(api);
  });
}

export const sha3Hash = (api, str) => (
  new Promise(async (resolve, reject) => {
    try {
      const hash = await api.app.crypto.sha3Hash(str)
      resolve(hash);
    } catch(err) {
      reject(err);
    }
  })
);

export const fetchPublicName = (api, publicName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const publicNamesMd = await api.getPublicNamesContainer();
      const result = await api.getMDataValueForKey(publicNamesMd, publicName);
      resolve(result);
    } catch(err) {
      reject(err);
    }
  });
};

export const fetchServiceName = (api, publicName, serviceName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const publicNamesMd = await api.getPublicNamesContainer();
      const hashPublicName = await sha3Hash(api, publicName);
      const publicNameMd = await api.getPublicNameMD(hashPublicName);
      const service = await api.getMDataValueForKey(publicNameMd, serviceName);
      resolve(service);
    } catch(err) {
      reject(err);
    }
  });
};
