import crypto from 'crypto';

import * as api from '../../app/safenet_comm/index.js';

export const errorCodeKey = '__proto__.code';

export const randomStr = () => crypto.randomBytes(10).toString('hex');

export const authoriseApp = () => new Promise(async (resolve) => {
  await api.authoriseMock();
  resolve(api);
});

export const genRandomEntryKey = () => crypto.randomBytes(32).toString('hex');

export const createRandomXorName = () => crypto.randomBytes(32);
