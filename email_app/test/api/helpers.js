import crypto from 'crypto';

import * as api from '../../app/safenet_comm/index.js';

export const errorCodeKey = '__proto__.code';

export const randomStr = () => crypto.randomBytes(10).toString('hex');

export const authoriseApp = () => new Promise(async (resolve) => {
  await api.authoriseMock();
  resolve(api);
});

export const genRandomEntryKey = () => crypto.randomBytes(32).toString('hex');

// export const fetchPublicName = (api, publicName) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const publicNamesMd = await api.getPublicNamesContainer();
//       const result = await api.getMDataValueForKey(publicNamesMd, publicName);
//       resolve(result);
//     } catch (err) {
//       reject(err);
//     }
//   });
// };

// export const fetchServiceName = (api, publicName, serviceName) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const hashPublicName = await sha3Hash(api, publicName);
//       const publicNameMd = await api.getPublicNameMD(hashPublicName);
//       const service = await api.getMDataValueForKey(publicNameMd, serviceName);
//       resolve(service);
//     } catch (err) {
//       reject(err);
//     }
//   });
// };
