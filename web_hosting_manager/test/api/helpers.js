import crypto from 'crypto';
import { Api as SafeApi } from '../../app/safenet_comm/api';

export const errorCodeKey = '__proto__.code';

export const randomStr = () => crypto.randomBytes(10).toString('hex');

export const newSafeApi = () => (
  new SafeApi()
);

export const authoriseApp = () => new Promise(async (resolve) => {
  const api = newSafeApi();
  await api.authoriseMock();
  resolve(api);
});

export const sha3Hash = (api, str) => (
  new Promise(async (resolve, reject) => {
    try {
      const hash = await api.sha3Hash(str);
      resolve(hash);
    } catch (err) {
      reject(err);
    }
  })
);

export const fetchPublicName = (api, publicName) => new Promise(async (resolve, reject) => {
  try {
    const publicNamesMd = await api.getPublicNamesContainer();
    const result = await api.getMDataValueForKey(publicNamesMd, publicName);
    resolve(result);
  } catch (err) {
    reject(err);
  }
});

export const fetchServiceName = (api, publicName, serviceName) =>
  new Promise(async (resolve, reject) => {
    try {
      const hashPublicName = await sha3Hash(api, publicName);
      const servicesCtnrMd = await api.getServicesContainer(hashPublicName);
      const service = await api.getMDataValueForKey(servicesCtnrMd, serviceName);
      resolve(service);
    } catch (err) {
      reject(err);
    }
  }
);
