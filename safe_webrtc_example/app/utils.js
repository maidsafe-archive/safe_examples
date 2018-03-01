
export const stringifyConnInfo = (connInfo) => {
  return JSON.stringify(connInfo);
};

export const parseConnInfo = (connInfo) => {
  return JSON.parse(connInfo);
};

export const putLog = (msg, data) => {
  if (!msg) {
    return;
  }
  console.log(`${(new Date()).toISOString()} :: ${msg} :: `, data);
};

export const bufToArr = (buf) => {
  if (!(buf instanceof Uint8Array)) {
    throw new Error('buf is not instance of Uint8Array');
  }
  return Array.from(buf);
};

export const arrToBuf = (arr) => {
  if (!(arr instanceof Array)) {
    throw new Error('arr is not instance of Array');
  }
  return new Uint8Array(arr);
};

export const uint8ToStr = (buf) => {
  if (!(buf instanceof Uint8Array)) {
    throw new Error('buf is not instance of Uint8Array');
  }
  return String.fromCharCode.apply(null, new Uint8Array(buf));
};
