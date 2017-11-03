import CONSTANTS from '../constants';

const insertToMData = async (md, key, val, toEncrypt) => {
  let keyToInsert = key;
  let valToInsert = val;

  try {
    const entries = await md.getEntries();
    const mut = await entries.mutate();
    if (toEncrypt) {
      keyToInsert = await md.encryptKey(key);
      valToInsert = await md.encryptValue(val);
    }
    await mut.insert(keyToInsert, valToInsert);
    await md.applyEntriesMutation(mut);
    return;
  } catch (err) {
    console.log('Insert into mutable data error :: ', err);
    throw err;
  }
};

/**
 * Create new Public Name
 * - Create new Public Mutable Data with sha3hash of publicName as its XORName
 * - Create new entry with publicName as key and XORName as its value
 * - Insert this entry within the _publicNames container
 * @param {string} publicName the public name
 */
export const createPublicName = async (app, name) => {
  try {
    if (!name) {
      return reject(makeError(CONSTANTS.APP_ERR_CODE.INVALID_PUBLIC_NAME, 'Invalid publicName'));
    }
    const metaName = `Services container for: ${name}`;
    const metaDesc = `Container where all the services are mapped for the Public Name: ${name}`;
    const hashedName = await app.crypto.sha3Hash(name.trim());

    const servCntr = await app.mutableData.newPublic(hashedName, CONSTANTS.TYPE_TAG.DNS);
    await servCntr.quickSetup({}, metaName, metaDesc);
    const pubNamesCntr = await app.auth.getContainer(CONSTANTS.ACCESS_CONTAINERS.PUBLIC_NAMES);
    await insertToMData(pubNamesCntr, name, hashedName, true);
    return;
  } catch (err) {
    console.log('Create public name error :: ', err);
    throw err;
  }
};

/**
 * Fetch Public Names under _publicNames container
 * @return {Promise<[PublicNames]>} array of Public Names
 */
export const fetchPublicNames = async (app) => {
  const publicNames = [];

  const decryptPublicName = (pubNamesCntr, encPubName) => (
    new Promise(async (resolve, reject) => {
      try {
        const decPubNameBuf = await pubNamesCntr.decrypt(encPubName);
        const decPubName = decPubNameBuf.toString();
        if (decPubName !== CONSTANTS.MD_META_KEY) {
          publicNames.push({
            name: decPubName
          });
        }
        resolve(true);
      } catch (err) {
        if (err.code === CONSTANTS.ERROR_CODE.SYMMETRIC_DECIPHER_FAILURE) {
          return resolve(true);
        }
        reject(err);
      }
    })
  );

  try {
    const pubNamesCntr = await app.auth.getContainer(CONSTANTS.ACCESS_CONTAINERS.PUBLIC_NAMES);
    const pubNames = await pubNamesCntr.getKeys();
    const pubNamesLen = await pubNames.len();
    if (pubNamesLen === 0) {
      return [];
    }
    const encPubNames = [];
    await pubNames.forEach((key) => {
      encPubNames.push(key);
    });

    const decryptPubNamesQ = [];
    for (const encPubName of encPubNames) {
      decryptPubNamesQ.push(decryptPublicName(pubNamesCntr, encPubName));
    }

    await Promise.all(decryptPubNamesQ);
    return publicNames;
  } catch (err) {
    console.error('Fetch public names error :: ', err);
    throw err;
  }
}
